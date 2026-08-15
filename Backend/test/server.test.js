import { test } from 'node:test';
import assert from 'node:assert/strict';

process.env.DB_PATH = ':memory:';
const { default: app } = await import('../server.js');

const withServer = async (fn) => {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  try {
    await fn(`http://localhost:${port}`);
  } finally {
    server.close();
  }
};

test('POST /api/v1/tickets/sync rechaza un payload sin tickets', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/v1/tickets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
  });
});

test('POST /api/v1/tickets/sync rechaza un ticket con formato inválido', async () => {
  await withServer(async (baseUrl) => {
    const res = await fetch(`${baseUrl}/api/v1/tickets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets: [{ id: 't1' }] }),
    });
    assert.equal(res.status, 400);
  });
});

test('POST /api/v1/tickets/sync acepta tickets válidos y devuelve sus ids', async () => {
  await withServer(async (baseUrl) => {
    const ticket = {
      id: 't1',
      items: [{ id: 'p1', name: 'Café', price: 3000, quantity: 1 }],
      total: 3000,
      timestamp: Date.now(),
    };

    const res = await fetch(`${baseUrl}/api/v1/tickets/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tickets: [ticket] }),
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.deepEqual(body.synced, ['t1']);
  });
});
