import { create } from 'zustand';
import { saveTicketLocal } from '../database/db';
import { syncTickets } from '../database/sync';

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

    syncTickets(); // best-effort, en segundo plano: no bloquea el cobro
  },
  sendToTable: (tableName) => set((state) => {
  if (state.orderItems.length === 0) return state; // Si la comanda está vacía, no hace nada

  // Obtenemos lo que ya tenía la mesa (o un arreglo vacío si es nueva)
  const existingTableItems = state.tableOrders[tableName] || [];

  // Fusionamos por id: si el producto ya está en la mesa, sumamos cantidades en vez de duplicar la entrada
  // (una entrada duplicada con el mismo id rompe la key de React en la lista de la comanda)
  const updatedTableItems = [...existingTableItems];
  for (const newItem of state.orderItems) {
    const existingIndex = updatedTableItems.findIndex((item) => item.id === newItem.id);
    if (existingIndex >= 0) {
      updatedTableItems[existingIndex] = {
        ...updatedTableItems[existingIndex],
        quantity: updatedTableItems[existingIndex].quantity + newItem.quantity,
      };
    } else {
      updatedTableItems.push(newItem);
    }
  }

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