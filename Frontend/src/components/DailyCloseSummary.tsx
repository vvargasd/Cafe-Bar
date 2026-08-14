// ==========================================
// 📊 DailyCloseSummary.tsx - Vista del 70% para Cierre de Día
// ==========================================
import React, { useEffect, useState } from 'react';
import { getTodayTickets, type Ticket } from '../database/db';
import { formatCOP } from '../utils/currency';

interface ProductSummary {
  id: string;
  name: string;
  quantity: number;
  totalRevenue: number;
}

const aggregateByProduct = (tickets: Ticket[]): ProductSummary[] => {
  const byProduct = new Map<string, ProductSummary>();

  for (const ticket of tickets) {
    for (const item of ticket.items) {
      const revenue = item.price * item.quantity;
      const existing = byProduct.get(item.id);
      if (existing) {
        existing.quantity += item.quantity;
        existing.totalRevenue += revenue;
      } else {
        byProduct.set(item.id, {
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          totalRevenue: revenue,
        });
      }
    }
  }

  return Array.from(byProduct.values()).sort((a, b) => b.totalRevenue - a.totalRevenue);
};

export const DailyCloseSummary: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);

  useEffect(() => {
    getTodayTickets().then(setTickets);
  }, []);

  if (!tickets) {
    return (
      <div className="flex-1 flex items-center justify-center text-[#795548] text-xl">
        Cargando...
      </div>
    );
  }

  const products = aggregateByProduct(tickets);
  const dayTotal = products.reduce((sum, product) => sum + product.totalRevenue, 0);

  return (
    <div className="h-full bg-[#FAF8F5] flex flex-col">
      <div className="flex justify-between items-baseline mb-6">
        <h2 className="text-2xl font-bold text-[#3E2723]">Cierre de Día</h2>
        <span className="text-[#795548] text-lg">
          {tickets.length} tickets · {formatCOP(dayTotal)}
        </span>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-[#A1887F] mt-10">No hay ventas registradas hoy.</p>
      ) : (
        <div className="flex-1 overflow-y-auto rounded-xl border border-[#E8E2D9] bg-white">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#E8E2D9] text-[#795548] text-sm uppercase tracking-wide">
                <th className="p-4">Producto</th>
                <th className="p-4 text-right">Unidades</th>
                <th className="p-4 text-right">Precio por unidad</th>
                <th className="p-4 text-right">Precio total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-[#E8E2D9] last:border-0">
                  <td className="p-4 font-semibold text-[#3E2723]">{product.name}</td>
                  <td className="p-4 text-right text-[#3E2723]">{product.quantity}</td>
                  <td className="p-4 text-right text-[#3E2723]">
                    {formatCOP(product.totalRevenue / product.quantity)}
                  </td>
                  <td className="p-4 text-right font-bold text-[#3E2723]">
                    {formatCOP(product.totalRevenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
