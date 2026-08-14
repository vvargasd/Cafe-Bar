import { create } from 'zustand';
import { useCartStore } from './cartStore';
import {
  type Customer,
  createCustomer,
  getCustomers,
  chargeCustomer,
  getCustomerOpenTickets,
  recordPayment,
} from '../database/customers';
import type { Ticket } from '../database/db';

interface CustomerStore {
  customers: Customer[];
  activeCustomerId: string | null;
  activeCustomerTickets: Ticket[];
  loadCustomers: () => Promise<void>;
  registerCustomer: (name: string, phone?: string) => Promise<void>;
  setActiveCustomer: (customerId: string | null) => Promise<void>;
  assignOrderToCustomer: (customerId: string) => Promise<void>;
  payCustomer: (customerId: string, amount: number) => Promise<void>;
}

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  customers: [],
  activeCustomerId: null,
  activeCustomerTickets: [],

  loadCustomers: async () => {
    const customers = await getCustomers();
    set({ customers });
  },

  registerCustomer: async (name, phone) => {
    await createCustomer(name, phone);
    await get().loadCustomers();
  },

  setActiveCustomer: async (customerId) => {
    if (!customerId) {
      set({ activeCustomerId: null, activeCustomerTickets: [] });
      return;
    }
    const tickets = await getCustomerOpenTickets(customerId);
    set({ activeCustomerId: customerId, activeCustomerTickets: tickets });
  },

  // Análogo a sendToTable, pero el cargo queda persistido de inmediato en RxDB:
  // a diferencia de una mesa, una deuda a fiado es real desde el momento en que se asigna.
  assignOrderToCustomer: async (customerId) => {
    const { orderItems, clearOrder } = useCartStore.getState();
    if (orderItems.length === 0) return;

    const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await chargeCustomer(customerId, orderItems, total);
    clearOrder();

    await get().loadCustomers();
    await get().setActiveCustomer(customerId);
  },

  // recordPayment puede lanzar si el monto supera el saldo pendiente; se propaga tal cual
  // para que quien llame (la UI del botón 'Abonar') muestre el error.
  payCustomer: async (customerId, amount) => {
    await recordPayment(customerId, amount);
    await get().loadCustomers();
    await get().setActiveCustomer(customerId);
  },
}));
