// ==========================================
// 🗄️ db.ts - Base de Datos Local Embebida (RxDB)
// ==========================================
import { createRxDatabase, type RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem } from '../store/cartStore';

// 1. Definimos el Esquema (La estructura estricta de nuestra venta)
const ticketSchema = {
  title: 'ticket schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { 
      type: 'string', 
      maxLength: 100 // RxDB requiere longitud máxima para llaves primarias
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          price: { type: 'number' },
          quantity: { type: 'number' }
        }
      }
    },
    total: { type: 'number' },
    synced: { type: 'boolean' }, // false por defecto hasta que el PC lo reciba
    timestamp: { type: 'number' }
  },
  required: ['id', 'items', 'total', 'synced', 'timestamp']
};

// Variable global para evitar crear múltiples instancias
let dbPromise: Promise<RxDatabase> | null = null;

// 2. Función para inicializar la Base de Datos
export const getDatabase = async (): Promise<RxDatabase> => {
  if (dbPromise) return dbPromise;

  dbPromise = (async () => {
    // Creamos la instancia de la base de datos local
    const db = await createRxDatabase({
      name: 'cafelaespanoladb',
      storage: getRxStorageDexie() // Usa IndexedDB nativo del navegador
    });

    // Creamos la "Colección" (como una tabla en SQL) para los tickets
    await db.addCollections({
      tickets: {
        schema: ticketSchema
      }
    });

    return db;
  })();

  return dbPromise;
};

// 3. Función auxiliar para guardar una venta (ID siempre generado en cliente)
export const saveTicketLocal = async (items: CartItem[], total: number) => {
  const db = await getDatabase();
  const newTicket = {
    id: uuidv4(), // ID único universal (A prueba de colisiones)
    items: items,
    total: total,
    synced: false, // ¡Chase se encargará de esto después!
    timestamp: Date.now()
  };

  await db.tickets.insert(newTicket);
  console.log('✅ Venta guardada permanentemente en la Tablet:', newTicket);
  return newTicket;
};