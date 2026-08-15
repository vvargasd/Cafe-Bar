import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_PATH = ':memory:';
const { default: db, upsertTicket } = await import('../db.js');

test('upsertTicket inserta un ticket nuevo', () => {
  upsertTicket({
    id: 'a1',
    items: [{ id: 'p1', name: 'Café', price: 3000, quantity: 1 }],
    total: 3000,
    timestamp: Date.now(),
  });

  const row = db.prepare('SELECT * FROM tickets WHERE id = ?').get('a1');
  assert.equal(row.id, 'a1');
  assert.equal(row.total, 3000);
});

test('upsertTicket con el mismo id actualiza en vez de duplicar', () => {
  const ticket = { id: 'a2', items: [], total: 1000, timestamp: 1000 };
  upsertTicket(ticket);
  upsertTicket({ ...ticket, total: 2000 });

  const rows = db.prepare('SELECT * FROM tickets WHERE id = ?').all('a2');
  assert.equal(rows.length, 1);
  assert.equal(rows[0].total, 2000);
});
