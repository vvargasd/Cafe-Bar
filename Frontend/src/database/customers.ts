// ==========================================
// 🧾 customers.ts - Clientes con saldo pendiente (fiado)
// ==========================================
import { v4 as uuidv4 } from 'uuid';
import { getDatabase, type Ticket } from './db';
import type { CartItem } from '../store/cartStore';

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  balance: number;
  createdAt: number;
}

export interface CustomerPayment {
  id: string;
  customerId: string;
  amount: number;
  timestamp: number;
}

export const createCustomer = async (name: string, phone?: string): Promise<Customer> => {
  const db = await getDatabase();
  const newCustomer: Customer = {
    id: uuidv4(),
    name,
    ...(phone ? { phone } : {}),
    balance: 0,
    createdAt: Date.now()
  };
  await db.customers.insert(newCustomer);
  return newCustomer;
};

export const getCustomers = async (): Promise<Customer[]> => {
  const db = await getDatabase();
  const results = await db.customers.find({ sort: [{ name: 'asc' }] }).exec();
  return results.map((doc) => doc.toJSON());
};

// Cargo a la cuenta del cliente: se guarda como ticket sin saldar (settled: false).
// No se reconoce como venta del día hasta que el saldo del cliente llegue a $0.
export const chargeCustomer = async (
  customerId: string,
  items: CartItem[],
  total: number
): Promise<Ticket> => {
  const db = await getDatabase();

  const newTicket: Ticket = {
    id: uuidv4(),
    items,
    total,
    synced: false,
    timestamp: Date.now(),
    customerId,
    settled: false
  };
  await db.tickets.insert(newTicket);

  const customerDoc = await db.customers.findOne(customerId).exec();
  if (customerDoc) {
    await customerDoc.patch({ balance: customerDoc.balance + total });
  }

  return newTicket;
};

// Ítems pendientes de pago de un cliente (equivalente a tableOrders[tableName], pero durable)
export const getCustomerOpenTickets = async (customerId: string): Promise<Ticket[]> => {
  const db = await getDatabase();
  const results = await db.tickets
    .find({ selector: { customerId, settled: false } })
    .exec();
  return results.map((doc) => doc.toJSON());
};

// Abono (parcial o total). Si el saldo llega a $0, se saldan todos los tickets
// pendientes del cliente con la fecha de hoy: así el Cierre de Día reconoce el
// monto completo acumulado el día en que efectivamente se cobra, sin importar
// de qué fecha venga cada ticket.
// Un abono que supere el saldo pendiente se rechaza sin tocar la base de datos.
export const recordPayment = async (customerId: string, amount: number): Promise<number> => {
  const db = await getDatabase();

  const customerDoc = await db.customers.findOne(customerId).exec();
  if (!customerDoc) throw new Error('Cliente no encontrado');
  if (amount > customerDoc.balance) {
    throw new Error('El abono no puede superar el saldo pendiente');
  }

  const payment: CustomerPayment = {
    id: uuidv4(),
    customerId,
    amount,
    timestamp: Date.now()
  };
  await db.customerPayments.insert(payment);

  const newBalance = customerDoc.balance - amount;
  await customerDoc.patch({ balance: newBalance });

  if (newBalance === 0) {
    const settledAt = Date.now();
    const openTickets = await db.tickets
      .find({ selector: { customerId, settled: false } })
      .exec();
    await Promise.all(openTickets.map((doc) => doc.patch({ settled: true, settledAt })));
  }

  return newBalance;
};
