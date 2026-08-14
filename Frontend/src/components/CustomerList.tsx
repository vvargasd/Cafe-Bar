// ==========================================
// 📒 CustomerList.tsx - Vista del 70% para Pendientes (clientes con fiado)
// ==========================================
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useCustomerStore } from '../store/customerStore';
import { formatCOP } from '../utils/currency';

export const CustomerList: React.FC = () => {
  const customers = useCustomerStore((state) => state.customers);
  const loadCustomers = useCustomerStore((state) => state.loadCustomers);
  const setActiveCustomer = useCustomerStore((state) => state.setActiveCustomer);
  const assignOrderToCustomer = useCustomerStore((state) => state.assignOrderToCustomer);
  const orderItems = useCartStore((state) => state.orderItems);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleCustomerClick = (customerId: string) => {
    if (orderItems.length > 0) {
      // Si hay una orden nueva en curso, la cargamos a la cuenta del cliente
      assignOrderToCustomer(customerId);
    } else {
      // Si no, abrimos su cuenta para revisión (aunque su saldo sea $0)
      setActiveCustomer(customerId);
    }
  };

  return (
    <div className="h-full bg-[#FAF8F5] p-6 flex flex-col">
      <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Clientes</h2>

      {customers.length === 0 ? (
        <p className="text-center text-[#A1887F] mt-10">No hay clientes registrados.</p>
      ) : (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-2">
          {customers.map((customer) => (
            <motion.button
              key={customer.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => handleCustomerClick(customer.id)}
              className={`min-h-[56px] rounded-xl flex items-center justify-between px-6 border-2 transition-all shadow-sm text-left
                ${customer.balance > 0
                  ? 'bg-[#3E2723] border-[#3E2723] text-white'
                  : 'bg-white border-[#D7CCC8] text-[#795548] hover:border-[#A1887F]'
                }
              `}
            >
              <span className="text-lg font-bold">{customer.name}</span>
              <span className={`text-lg font-bold ${customer.balance > 0 ? 'text-[#FFC107]' : 'text-[#A1887F]'}`}>
                {formatCOP(customer.balance)}
              </span>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};
