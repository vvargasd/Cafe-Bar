// db.js
import Database from 'better-sqlite3';

const db = new Database(process.env.DB_PATH || 'cafelaespanola.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    items TEXT NOT NULL,
    total REAL NOT NULL,
    timestamp INTEGER NOT NULL,
    received_at INTEGER NOT NULL
  )
`);

const upsertTicketStmt = db.prepare(`
  INSERT INTO tickets (id, items, total, timestamp, received_at)
  VALUES (@id, @items, @total, @timestamp, @receivedAt)
  ON CONFLICT(id) DO UPDATE SET
    items = excluded.items,
    total = excluded.total,
    timestamp = excluded.timestamp
`);

// Upsert por id: un mismo ticket reenviado (reintento, cierre presionado varias veces) no duplica la venta
export const upsertTicket = (ticket) => {
  upsertTicketStmt.run({
    id: ticket.id,
    items: JSON.stringify(ticket.items),
    total: ticket.total,
    timestamp: ticket.timestamp,
    receivedAt: Date.now()
  });
};

export default db;
