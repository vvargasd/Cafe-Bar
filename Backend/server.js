// server.js
import express from 'express';
import cors from 'cors';
import { upsertTicket } from './db.js';

const app = express();
app.use(cors()); // Red local confiable: la tablet y el PC nodo corren en orígenes distintos
app.use(express.json());

// Middleware para simular latencia de red (Fijado en 30ms según requerimiento)
app.use((req, res, next) => {
    setTimeout(next, 30);
});

// Endpoints
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

// Solo escucha si se ejecuta directamente (node server.js), no al importarlo desde los tests
if (import.meta.url === `file://${process.argv[1]}`) {
    app.listen(PORT, () => {
        console.log(`Mock server ejecutándose en el puerto ${PORT}. Latencia artificial inyectada: 30ms.`);
    });
}

export default app;