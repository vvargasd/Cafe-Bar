// ==========================================
// 🗄️ db.ts - Base de Datos Local Embebida (RxDB)
// ==========================================
import { createRxDatabase, addRxPlugin, type RxDatabase } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { RxDBMigrationSchemaPlugin } from 'rxdb/plugins/migration-schema';
import { v4 as uuidv4 } from 'uuid';
import type { CartItem } from '../store/cartStore';

addRxPlugin(RxDBMigrationSchemaPlugin);

// 1. Definimos el Esquema (La estructura estricta de nuestra venta)
const ticketSchema = {
  title: 'ticket schema',
  version: 1,
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
    timestamp: { type: 'number' },
    customerId: { type: 'string', maxLength: 100 }, // presente solo si es un cargo a fiado
    settled: { type: 'boolean' }, // true en ventas normales (se cobran de inmediato); false en fiado hasta que el cliente salde su saldo
    settledAt: { type: 'number' } // fecha en que se saldó (determina en qué Cierre de Día se reconoce el fiado)
  },
  required: ['id', 'items', 'total', 'synced', 'timestamp', 'settled']
};

// Migración v0 -> v1: los tickets ya existentes son ventas normales, ya reconocidas el día de su creación
const ticketMigrationStrategies = {
  1: (oldDoc: Record<string, unknown>) => ({ ...oldDoc, settled: true })
};

const customerSchema = {
  title: 'customer schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    name: { type: 'string' },
    phone: { type: 'string' },
    balance: { type: 'number' }, // saldo pendiente, denormalizado para lectura directa en la lista
    createdAt: { type: 'number' }
  },
  required: ['id', 'name', 'balance', 'createdAt']
};

const customerPaymentSchema = {
  title: 'customer payment schema',
  version: 0,
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: { type: 'string', maxLength: 100 },
    customerId: { type: 'string', maxLength: 100 },
    amount: { type: 'number' },
    timestamp: { type: 'number' }
  },
  required: ['id', 'customerId', 'amount', 'timestamp']
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

    // Creamos las "Colecciones" (como tablas en SQL)
    await db.addCollections({
      tickets: {
        schema: ticketSchema,
        migrationStrategies: ticketMigrationStrategies
      },
      customers: {
        schema: customerSchema
      },
      customerPayments: {
        schema: customerPaymentSchema
      }
    });

    return db;
  })();

  return dbPromise;
};

export interface Ticket {
  id: string;
  items: CartItem[];
  total: number;
  synced: boolean;
  timestamp: number;
  customerId?: string;
  settled: boolean;
  settledAt?: number;
}

// 3. Función auxiliar para guardar una venta (ID siempre generado en cliente)
export const saveTicketLocal = async (items: CartItem[], total: number): Promise<Ticket> => {
  const db = await getDatabase();
  const newTicket: Ticket = {
    id: uuidv4(), // ID único universal (A prueba de colisiones)
    items: items,
    total: total,
    synced: false, // pendiente de sincronizar con el PC central
    timestamp: Date.now(),
    settled: true // venta normal: se reconoce como ingreso el mismo día
  };

  await db.tickets.insert(newTicket);
  console.log('✅ Venta guardada permanentemente en la Tablet:', newTicket);
  return newTicket;
};

// 4. Función auxiliar para el resumen de cierre de día (consulta 100% local)
export const getTodayTickets = async (): Promise<Ticket[]> => {
  const db = await getDatabase();

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const results = await db.tickets.find({
    selector: {
      timestamp: {
        $gte: startOfDay.getTime(),
        $lte: endOfDay.getTime()
      }
    }
  }).exec();

  return results.map((doc) => doc.toJSON());
};