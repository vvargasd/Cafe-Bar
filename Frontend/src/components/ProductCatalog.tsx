// ==========================================
// 📦 ProductCatalog.tsx - Catálogo con Anclas Visuales
// ==========================================
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Coffee, CupSoda, Utensils, Candy, Star } from 'lucide-react';
import { useCartStore } from '../store/cartStore';

type Category = '⭐ Más Vendidos' | 'Máquina' | 'Nevera' | 'Comida Rápida' | 'Confitería';

interface MockProduct {
  id: string;
  name: string;
  category: Category;
  price: number;
  isTopSeller: boolean;
}

// Inventario simulado (fuera del componente: es data estática, no debe recrearse en cada render)
const mockInventory: MockProduct[] = [
  { id: 'm1', name: 'Capuchino', category: 'Máquina', price: 3000, isTopSeller: true },
  { id: 'm2', name: 'Aromatica de Panela', category: 'Máquina', price: 2500, isTopSeller: false },
  { id: 'n1', name: 'Agua Manantial', category: 'Nevera', price: 3000, isTopSeller: true },
  { id: 'n2', name: 'Cerveza Aguila', category: 'Nevera', price: 3500, isTopSeller: false },
  { id: 'cr1', name: 'Pastel de Pollo', category: 'Comida Rápida', price: 3000, isTopSeller: true },
  { id: 'c1', name: 'Chocorramo', category: 'Confitería', price: 2500, isTopSeller: false },
  { id: 'c2', name: 'Empanada', category: 'Comida Rápida', price: 2500, isTopSeller: true },
];

export const ProductCatalog: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('⭐ Más Vendidos');

  const addProduct = useCartStore((state) => state.addProduct);

  const categories: Category[] = [
    '⭐ Más Vendidos',
    'Máquina',
    'Nevera',
    'Comida Rápida',
    'Confitería'
  ];

  // ==========================================
  // 🎨 Diccionario Visual (El Toque Mágico)
  // Asigna un ícono y un color semántico de forma automática
  // ==========================================
  const getCategoryIcon = (category: Category) => {
    // Nota de accesibilidad: aria-hidden="true" porque el texto ya describe el producto
    switch (category) {
      case 'Máquina': 
        return <Coffee aria-hidden="true" className="w-8 h-8 text-[#6D4C41]" />; // Marrón cálido
      case 'Nevera': 
        return <CupSoda aria-hidden="true" className="w-8 h-8 text-[#0288D1]" />; // Azul frío
      case 'Comida Rápida': 
        return <Utensils aria-hidden="true" className="w-8 h-8 text-[#E64A19]" />; // Naranja apetitoso
      case 'Confitería': 
        return <Candy aria-hidden="true" className="w-8 h-8 text-[#C2185B]" />; // Rosa dulce
      default: 
        return <Star aria-hidden="true" className="w-8 h-8 text-[#FFC107]" />; // Dorado por defecto
    }
  };

  const displayedProducts = useMemo(() => {
    if (activeCategory === '⭐ Más Vendidos') {
      return mockInventory
        .filter(product => product.isTopSeller)
        .slice(0, 12);
    }
    const filtered = mockInventory.filter(product => product.category === activeCategory);
    return filtered.sort((a, b) => (a.isTopSeller === b.isTopSeller ? 0 : a.isTopSeller ? -1 : 1));
  }, [activeCategory]);

  return (
    <div className="flex flex-col h-full bg-[#FAF8F5]">
      
      {/* Zona 1: Filtros Superiores */}
      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 border-b border-[#E8E2D9] scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap h-14 px-6 rounded-full font-bold text-md transition-colors shadow-sm ${
              activeCategory === cat 
                ? 'bg-[#3E2723] text-white' 
                : 'bg-white text-[#795548] border border-[#D7CCC8] hover:bg-[#EFEBE9]'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>

      {/* Zona 2: Cuadrícula de Productos */}
      <div className="grid grid-cols-3 gap-4 overflow-y-auto pb-6 pr-2">
        {displayedProducts.map((product) => (
          <motion.button
            key={product.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => addProduct({ 
              id: product.id, 
              name: product.name, 
              price: product.price 
            })}
            className="relative h-32 bg-white rounded-xl shadow-sm border border-[#E8E2D9] flex flex-col items-center justify-center p-2 hover:shadow-md transition-all overflow-hidden"
            aria-label={`Añadir ${product.name} a la orden`}
          >
            {/* Indicador sutil de Top Seller */}
            {product.isTopSeller && activeCategory !== '⭐ Más Vendidos' && (
              <div className="absolute top-0 right-0 w-0 h-0 border-t-[24px] border-l-[24px] border-t-[#FFC107] border-l-transparent"></div>
            )}
            
            {/* Ícono automático ocupando la zona superior */}
            <div className="mb-1 opacity-90">
              {getCategoryIcon(product.category)}
            </div>
            
            {/* Texto en la zona inferior, sin cortarse */}
            <span className="text-md font-bold text-[#3E2723] text-center leading-tight">
              {product.name}
            </span>
            <span className="text-sm text-[#795548] font-medium mt-1">
              ${product.price.toFixed(2)}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};