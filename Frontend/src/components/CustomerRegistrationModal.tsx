// ==========================================
// 🧾 CustomerRegistrationModal.tsx - Alta de nuevo cliente (fiado)
// ==========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomerStore } from '../store/customerStore';

interface CustomerRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerRegistrationModal: React.FC<CustomerRegistrationModalProps> = ({ isOpen, onClose }) => {
  const registerCustomer = useCustomerStore((state) => state.registerCustomer);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    await registerCustomer(trimmedName, phone.trim() || undefined);
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FAF8F5] rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Nuevo Cliente</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="customer-name" className="text-[#795548] font-semibold">
              Nombre
            </label>
            <input
              id="customer-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoFocus
              required
              className="h-14 px-4 rounded-lg border-2 border-[#D7CCC8] text-[#3E2723] text-lg focus:outline-none focus:border-[#3E2723]"
              placeholder="Ej: Don Carlos"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="customer-phone" className="text-[#795548] font-semibold">
              Teléfono (opcional)
            </label>
            <input
              id="customer-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="h-14 px-4 rounded-lg border-2 border-[#D7CCC8] text-[#3E2723] text-lg focus:outline-none focus:border-[#3E2723]"
              placeholder="Ej: 300 123 4567"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 h-14 rounded-xl font-bold text-lg border-2 border-[#3E2723] text-[#3E2723] bg-white"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-xl font-bold text-lg bg-[#3E2723] text-white shadow-sm"
            >
              Registrar
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
