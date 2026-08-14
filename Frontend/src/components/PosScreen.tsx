// ==========================================
// ☕ Café La Española - Main POS Screen
// ==========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { ProductCatalog } from './ProductCatalog';
import { TableMap } from './TableMap';
import { DailyCloseSummary } from './DailyCloseSummary';
import { Trash2, Lock } from 'lucide-react';
import { formatCOP } from '../utils/currency';

// Definimos estrictamente las vistas permitidas
type TabType = 'Productos' | 'Mesas' | 'Pendientes' | 'Cierre';

export const PosScreen: React.FC = () => {
  // Consumo tipado del estado global de Zustand
  const { orderItems, removeProduct, activeTable, setActiveTable, tableOrders, checkout } = useCartStore();

  // Estado local fuertemente tipado
  const [activeTab, setActiveTab] = useState<TabType>('Productos');

  // Lógica de los "Dos Modos"
  const currentDisplayItems = activeTable ? (tableOrders[activeTable] || []) : orderItems;
  const panelTitle = activeTable ? `Cuenta: Mesa ${activeTable}` : 'Nueva Orden';
  const currentTotal = currentDisplayItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Array tipado para iterar los botones de navegación de forma segura ('Cierre' no entra aquí: vive aparte, en el ícono discreto)
  const tabs: TabType[] = ['Productos', 'Mesas', 'Pendientes'];

  return (
    <div className="flex h-screen w-full bg-[#FAF8F5] font-sans">
      
      {/* ==========================================
        PANEL IZQUIERDO (70%): Área Dinámica
        ========================================== */}
      <section className="w-[70%] p-6 flex flex-col border-r border-[#E8E2D9]">
        
        {/* Navegación Superior - Zonas Táctiles "Barista-Proof" */}
        <nav className="flex items-center gap-4 mb-8">
          {tabs.map((tab) => (
            <motion.button
              key={tab}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActiveTab(tab);
                setActiveTable(null);
              }}
              className={`h-14 px-8 rounded-lg font-bold text-lg transition-colors ${
                activeTab === tab 
                  ? 'bg-[#3E2723] text-white shadow-md' 
                  : 'bg-white text-[#3E2723] border-2 border-[#3E2723]'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab('Cierre');
              setActiveTable(null);
            }}
            aria-label="Cerrar día"
            className={`ml-auto h-12 w-12 flex items-center justify-center rounded-lg border transition-colors ${
              activeTab === 'Cierre'
                ? 'bg-[#3E2723] border-[#3E2723] text-white'
                : 'bg-white border-[#D7CCC8] text-[#795548] hover:bg-[#EFEBE9]'
            }`}
          >
            <Lock aria-hidden="true" className="w-5 h-5" />
          </motion.button>
        </nav>

        {/* Cuadrícula de Productos */}
        {/* Cuadrícula de Productos (Delegada a nuestro nuevo componente) */}
        {activeTab === 'Productos' && (
          <div className="flex-1 overflow-hidden">
            <ProductCatalog />
          </div>
        )}

        {/* Vistas en construcción */}
        {activeTab === 'Mesas' && (
          <div className="flex-1 flex items-center justify-center text-[#795548] text-xl">
            <TableMap />
          </div>
        )}
        {activeTab === 'Pendientes' && (
          <div className="flex-1 flex items-center justify-center text-[#795548] text-xl">
            Directorio de Clientes Frecuentes en construcción... 📒
          </div>
        )}
        {activeTab === 'Cierre' && (
          <div className="flex-1 overflow-hidden">
            <DailyCloseSummary />
          </div>
        )}

      </section>

      {/* ==========================================
        PANEL DERECHO (30%): Comanda y Cobro
        ========================================== */}
      <aside className="w-[30%] bg-white p-6 flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
        <h2 className="text-2xl font-bold text-[#3E2723] mb-6 border-b pb-4">{panelTitle}</h2>
        
        {/* Lista de la Orden */}
        {/* Lista de la Orden con Swipe-to-Delete */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-3 pr-2">
          {currentDisplayItems.length === 0 ? (
            <p className="text-center text-[#A1887F] mt-10">La cuenta está vacía.</p>
          ) : (
            currentDisplayItems.map((item) => (
              /* Contenedor base (Fondo rojo revelable) */
              <div key={item.id} className="relative rounded-lg bg-[#E53935] flex items-center justify-end px-4 h-16 overflow-hidden shadow-sm">
                
                {/* Ícono de papelera que se revela al deslizar */}
                <Trash2 className="text-white w-6 h-6" />

                {/* Tarjeta del producto deslizable */}
                <motion.div
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }} // Hace que regrese a su lugar si no desliza lo suficiente
                  dragElastic={{ left: 0.5, right: 0 }} // Solo permite estirar hacia la izquierda
                  onDragEnd={(_event, info) => {
                    // Si el usuario desliza más de 80 píxeles a la izquierda, ¡eliminamos el producto!
                    if (info.offset.x < -80) {
                      removeProduct(item.id);
                    }
                  }}
                  className="absolute inset-0 bg-white border border-[#E8E2D9] rounded-lg flex justify-between items-center px-4"
                >
                  <span className="font-semibold text-[#3E2723] text-lg">
                    <span className="text-[#795548] mr-3 font-bold">{item.quantity}x</span>
                    {item.name}
                  </span>
                  <span className="text-[#3E2723] font-bold text-lg">
                    {formatCOP(item.price * item.quantity)}
                  </span>
                </motion.div>
              </div>
            ))
          )}
        </div>

        {/* Zona de Acciones Finales */}
        <div className="mt-6 pt-6 border-t border-[#E8E2D9] flex flex-col gap-4">
          <div className="flex justify-between text-2xl font-bold text-[#3E2723] mb-4">
            <span>Total:</span>
            <span>
              {formatCOP(currentTotal)}
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => checkout(activeTable)}
            className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white py-4 rounded-xl font-bold text-xl transition-colors shadow-sm"
          >
            Cobrar en Caja
          </motion.button>
        </div>

      </aside>
    </div>
  );
};