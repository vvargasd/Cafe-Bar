import { create } from 'zustand';
import { saveTicketLocal } from '../database/db';

// 1. Interfaces basadas estrictamente en el contrato de Chase
export interface Product {
  id: string;
  name: string;
  price: number;  
}



export interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  orderItems: CartItem[];
  addProduct: (product: Product) => void;
  removeProduct: (productId: string) => void;
  tableOrders: Record<string, CartItem[]>;
  sendToTable: (tableName: string) => void;
  clearOrder: () => void;
  activeTable: string | null;
  setActiveTable: (tableName: string | null) => void;
  payTable: (tableName: string) => void;
  checkout: (tableName: string | null) => Promise<void>;
}

// 2. Creación del store con tipado fuerte
export const useCartStore = create<CartStore>((set, get) => ({
  orderItems: [],
  tableOrders: {},
  activeTable: null,

  setActiveTable: (tableName) => set({ activeTable: tableName }),

payTable: (tableName) => set((state) => {
  const newTableOrders = { ...state.tableOrders };
  delete newTableOrders[tableName]; // Eliminamos la cuenta de la mesa (¡ya pagó!)
  return {
    tableOrders: newTableOrders,
    activeTable: null // Salimos del modo revisión
  };
}),

  // Persiste el ticket en RxDB primero; solo si eso tiene éxito se limpia el estado en memoria
  checkout: async (tableName) => {
    const state = get();
    const items = tableName ? (state.tableOrders[tableName] || []) : state.orderItems;
    if (items.length === 0) return;

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    await saveTicketLocal(items, total);

    if (tableName) {
      get().payTable(tableName);
    } else {
      get().clearOrder();
    }
  },
  sendToTable: (tableName) => set((state) => {
  if (state.orderItems.length === 0) return state; // Si la comanda está vacía, no hace nada

  // Obtenemos lo que ya tenía la mesa (o un arreglo vacío si es nueva)
  const existingTableItems = state.tableOrders[tableName] || [];
  
  // Fusionamos los productos (aquí podríamos agruparlos por ID, pero por ahora los sumamos)
  const updatedTableItems = [...existingTableItems, ...state.orderItems];

  return {
    tableOrders: {
      ...state.tableOrders,
      [tableName]: updatedTableItems
    },
    orderItems: [], // Limpiamos la comanda principal para el siguiente cliente
  };
}),

  addProduct: (product) =>
    set((state) => {
      const existingItem = state.orderItems.find(
        (item) => item.id === product.id
      );

      if (existingItem) {
        return {
          orderItems: state.orderItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }

      return {
        orderItems: [...state.orderItems, { ...product, quantity: 1 }],
      };
    }),

  removeProduct: (productId) =>
    set((state) => ({
      orderItems: state.orderItems.filter(
        (item) => item.id !== productId
      ),
    })),

  clearOrder: () => set({ orderItems: [] }),
}));