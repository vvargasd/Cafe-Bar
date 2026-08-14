// ==========================================
// 💰 CustomerPaymentModal.tsx - Abono parcial a la cuenta de un cliente
// ==========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCustomerStore } from '../store/customerStore';
import { formatCOP } from '../utils/currency';

interface CustomerPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
  balance: number;
}

export const CustomerPaymentModal: React.FC<CustomerPaymentModalProps> = ({
  isOpen,
  onClose,
  customerId,
  customerName,
  balance,
}) => {
  const payCustomer = useCustomerStore((state) => state.payCustomer);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setAmount('');
    setError(null);
    onClose();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Ingresa un monto válido.');
      return;
    }

    try {
      await payCustomer(customerId, parsedAmount);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el abono.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#FAF8F5] rounded-2xl shadow-xl w-full max-w-md p-8"
      >
        <h2 className="text-2xl font-bold text-[#3E2723] mb-2">Abonar a {customerName}</h2>
        <p className="text-[#795548] mb-6">Saldo pendiente: {formatCOP(balance)}</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label htmlFor="payment-amount" className="text-[#795548] font-semibold">
              Monto a abonar
            </label>
            <input
              id="payment-amount"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={amount}
              onChange={(event) => {
                setAmount(event.target.value);
                setError(null);
              }}
              autoFocus
              required
              className="h-14 px-4 rounded-lg border-2 border-[#D7CCC8] text-[#3E2723] text-lg focus:outline-none focus:border-[#3E2723]"
              placeholder="Ej: 20000"
            />
          </div>

          {error && <p className="text-[#E53935] font-semibold">{error}</p>}

          <div className="flex gap-4 mt-4">
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 h-14 rounded-xl font-bold text-lg border-2 border-[#3E2723] text-[#3E2723] bg-white"
            >
              Cancelar
            </motion.button>
            <motion.button
              type="submit"
              whileTap={{ scale: 0.98 }}
              className="flex-1 h-14 rounded-xl font-bold text-lg bg-[#3E2723] text-white shadow-sm"
            >
              Confirmar
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
