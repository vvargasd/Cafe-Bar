// ==========================================
// ☕ Café La Española - Main POS Screen
// ==========================================
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useCartStore } from '../store/cartStore';
import { useCustomerStore } from '../store/customerStore';
import { ProductCatalog } from './ProductCatalog';
import { TableMap } from './TableMap';
import { CustomerList } from './CustomerList';
import { CustomerRegistrationModal } from './CustomerRegistrationModal';
import { CustomerPaymentModal } from './CustomerPaymentModal';
import { DailyCloseSummary } from './DailyCloseSummary';
import { Trash2, Lock, UserPlus } from 'lucide-react';
import { formatCOP } from '../utils/currency';

// Definimos estrictamente las vistas permitidas
type TabType = 'Productos' | 'Mesas' | 'Pendientes' | 'Cierre';

export const PosScreen: React.FC = () => {
  // Consumo tipado del estado global de Zustand
  const { orderItems, removeProduct, activeTable, setActiveTable, tableOrders, checkout } = useCartStore();
  const { customers, activeCustomerId, activeCustomerTickets, setActiveCustomer, payCustomer } = useCustomerStore();

  // Estado local fuertemente tipado
  const [activeTab, setActiveTab] = useState<TabType>('Productos');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const activeCustomer = activeCustomerId
    ? customers.find((customer) => customer.id === activeCustomerId)
    : null;

  // La cuenta de un cliente puede venir de varios tickets abiertos (distintos días);
  // se agrupan por producto para mostrarlos igual que la cuenta de una mesa
  const customerDisplayItems = activeCustomerTickets.reduce<typeof orderItems>((merged, ticket) => {
    for (const item of ticket.items) {
      const existing = merged.find((entry) => entry.id === item.id);
      if (existing) {
        existing.quantity += item.quantity;
      } else {
        merged.push({ ...item });
      }
    }
    return merged;
  }, []);

  // Lógica de los "Tres Modos": mesa, cliente (fiado) o nueva orden
  const currentDisplayItems = activeTable
    ? (tableOrders[activeTable] || [])
    : activeCustomer
      ? customerDisplayItems
      : orderItems;
  const panelTitle = activeTable
    ? `Cuenta: Mesa ${activeTable}`
    : activeCustomer
      ? `Cuenta: ${activeCustomer.name}`
      : 'Nueva Orden';
  // En modo cliente el total es el saldo pendiente (descuenta abonos ya hechos),
  // no la suma bruta de los ítems cargados
  const currentTotal = activeCustomer
    ? activeCustomer.balance
    : currentDisplayItems.reduce((total, item) => total + (item.price * item.quantity), 0);

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
                setActiveCustomer(null);
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
            onClick={() => setIsRegisterModalOpen(true)}
            aria-label="Registrar cliente"
            className="ml-auto h-12 w-12 flex items-center justify-center rounded-lg border bg-white border-[#D7CCC8] text-[#795548] hover:bg-[#EFEBE9] transition-colors"
          >
            <UserPlus aria-hidden="true" className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setActiveTab('Cierre');
              setActiveTable(null);
              setActiveCustomer(null);
            }}
            aria-label="Cerrar día"
            className={`h-12 w-12 flex items-center justify-center rounded-lg border transition-colors ${
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
          <div className="flex-1 overflow-hidden">
            <CustomerList />
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

          {activeCustomer ? (
            <div className="flex gap-4">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsPaymentModalOpen(true)}
                className="flex-1 bg-white border-2 border-[#3E2723] text-[#3E2723] py-4 rounded-xl font-bold text-xl transition-colors"
              >
                Abonar
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                disabled={activeCustomer.balance <= 0}
                onClick={() => payCustomer(activeCustomer.id, activeCustomer.balance)}
                className="flex-1 bg-[#4CAF50] hover:bg-[#43A047] text-white py-4 rounded-xl font-bold text-xl transition-colors shadow-sm disabled:opacity-50"
              >
                Cobrar en Caja
              </motion.button>
            </div>
          ) : (
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => checkout(activeTable)}
              className="w-full bg-[#4CAF50] hover:bg-[#43A047] text-white py-4 rounded-xl font-bold text-xl transition-colors shadow-sm"
            >
              Cobrar en Caja
            </motion.button>
          )}
        </div>

      </aside>

      <CustomerRegistrationModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />

      {activeCustomer && (
        <CustomerPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          customerId={activeCustomer.id}
          customerName={activeCustomer.name}
          balance={activeCustomer.balance}
        />
      )}
    </div>
  );
};