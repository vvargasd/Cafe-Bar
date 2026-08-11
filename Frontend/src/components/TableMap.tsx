// ==========================================
// 🪑 TableMap.tsx - Vista del 70% para Mesas
// ==========================================
import React from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';

export const TableMap: React.FC = () => {
  const tableOrders = useCartStore((state) => state.tableOrders);
  const sendToTable = useCartStore((state) => state.sendToTable);
  const orderItems = useCartStore((state) => state.orderItems);
  const setActiveTable = useCartStore((state) => state.setActiveTable);
  const tableNames = ['Barra', 'Pared', 'Matas', 'TV'];

  const handleTableClick = (tableName: string) => {
    const itemsInTable = tableOrders[tableName] || [];
    const isOccupied = itemsInTable.length > 0;

    if (orderItems.length > 0) {
      // 1. Si hay una orden nueva en curso, la enviamos a la mesa
      sendToTable(tableName);
    } else if (isOccupied) {
      // 2. Si la comanda está vacía y la mesa tiene cuenta, la abrimos para revisión
      setActiveTable(tableName);
    }
  };

  return (
    <div className="h-full bg-[#FAF8F5] p-6">
      <h2 className="text-2xl font-bold text-[#3E2723] mb-6">Mapa de Mesas</h2>
      
      <div className="grid grid-cols-2 gap-6 h-[80%]">
        {tableNames.map((name) => {
          const itemsInTable = tableOrders[name] || [];
          const isOccupied = itemsInTable.length > 0;
          
          // Calculamos el total de la mesa si está ocupada
          const tableTotal = itemsInTable.reduce((total, item) => total + (item.price * item.quantity), 0);

          return (
            <motion.button
              key={name}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTableClick(name)}
              className={`relative rounded-2xl flex flex-col items-center justify-center border-2 transition-all shadow-sm
                ${isOccupied 
                  ? 'bg-[#3E2723] border-[#3E2723] text-white' // Estilo Ocupada
                  : 'bg-white border-dashed border-[#D7CCC8] text-[#795548] hover:border-[#A1887F]' // Estilo Libre
                }
              `}
            >
              <span className="text-3xl font-bold mb-2">{name}</span>
              
              {isOccupied ? (
                <div className="flex flex-col items-center">
                  <span className="text-lg text-[#D7CCC8]">{itemsInTable.length} ítems</span>
                  <span className="text-2xl font-bold text-[#FFC107]">${tableTotal.toFixed(2)}</span>
                </div>
              ) : (
                <span className="text-lg font-medium">Libre</span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};