// ==========================================
// 🔄 sync.ts - Sincronización best-effort con el PC nodo
// ==========================================
import { getDatabase } from './db';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

// Envía los tickets pendientes (synced: false) al PC nodo.
// Es puramente aditivo: si falla (nodo apagado, sin red), no se lanza error
// visible ni se bloquea la app. Los tickets quedan pendientes y se reintenta después.
export const syncTickets = async (): Promise<void> => {
  const db = await getDatabase();
  const pending = await db.tickets.find({ selector: { synced: false } }).exec();
  if (pending.length === 0) return;

  try {
    const response = await fetch(`${API_URL}/api/v1/tickets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets: pending.map((doc) => doc.toJSON()) }),
    });

    if (!response.ok) return;

    const { synced }: { synced: string[] } = await response.json();
    const syncedIds = new Set(synced);

    await Promise.all(
      pending
        .filter((doc) => syncedIds.has(doc.id))
        .map((doc) => doc.patch({ synced: true }))
    );
  } catch {
    // Sin red o nodo apagado: no es un error de la app, se reintentará después.
  }
};
