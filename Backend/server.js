// server.js
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { upsertTicket } from './db.js';

const app = express();
app.use(cors()); // Red local confiable: la tablet y el PC nodo corren en orígenes distintos
app.use(express.json());

// Middleware para simular latencia de red (Fijado en 30ms según requerimiento)
app.use((req, res, next) => {
    setTimeout(next, 30);
});

// Datos en memoria (Persistencia volátil para el prototipo)
const products = [
    { id: "a1b2c3d4-1234-5678-90ab-cdef12345678", name: "Gesha Geisha", origin: "Panamá", price: 18.50 },
    { id: "e5f6g7h8-1234-5678-90ab-cdef12345678", name: "Bourbon Rosado", origin: "Colombia", price: 12.00 },
    { id: "i9j0k1l2-1234-5678-90ab-cdef12345678", name: "Yirgacheffe", origin: "Etiopía", price: 14.25 }
];

const inventory = [
    { productId: "a1b2c3d4-1234-5678-90ab-cdef12345678", stockQuantity: 15.5, unit: "kg" },
    { productId: "e5f6g7h8-1234-5678-90ab-cdef12345678", stockQuantity: 42.0, unit: "kg" },
    { productId: "i9j0k1l2-1234-5678-90ab-cdef12345678", stockQuantity: 8.2, unit: "kg" }
];

// Endpoints
app.get('/api/v1/products', (req, res) => {
    res.status(200).json(products);
});

app.get('/api/v1/inventory', (req, res) => {
    res.status(200).json(inventory);
});

app.post('/api/v1/sales', (req, res) => {
    const { items, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0 || !paymentMethod) {
        return res.status(400).json({ error: "Payload inválido. Revise el contrato OpenAPI." });
    }

    // Deducción rudimentaria de inventario para consistencia del prototipo
    items.forEach(item => {
        const invItem = inventory.find(i => i.productId === item.productId);
        if (invItem) {
            // Asumiendo ventas en gramos para simplificar el modelo base
            invItem.stockQuantity -= (item.quantity * 0.25); 
        }
    });

    res.status(201).json({
        transactionId: crypto.randomUUID(),
        status: "completed",
        timestamp: new Date().toISOString()
    });
});

app.post('/api/v1/tickets/sync', (req, res) => {
    const { tickets } = req.body;

    if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
        return res.status(400).json({ error: "Payload inválido. Se espera { tickets: Ticket[] }." });
    }

    const isValidTicket = (t) =>
        typeof t.id === 'string' &&
        Array.isArray(t.items) &&
        typeof t.total === 'number' &&
        typeof t.timestamp === 'number';

    if (!tickets.every(isValidTicket)) {
        return res.status(400).json({ error: "Uno o más tickets no cumplen el formato esperado." });
    }

    // Upsert por id: reenviar el mismo ticket (reintento de red, cierre presionado varias veces) no duplica la venta
    tickets.forEach(upsertTicket);

    res.status(200).json({ synced: tickets.map(t => t.id) });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Mock server ejecutándose en el puerto ${PORT}. Latencia artificial inyectada: 30ms.`);
});