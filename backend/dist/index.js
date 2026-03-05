import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { client, connect, dbName, resetConnection } from './db.js';
import usersRouter from './routes/users.js';
dotenv.config();
const port = Number(process.env.PORT ?? 4000);
const app = express();
app.use(cors());
app.use(express.json());
app.get('/api/health', async (_req, res) => {
    try {
        await connect();
        await client.db(dbName).command({ ping: 1 });
        res.json({ ok: true, service: 'backend', database: 'connected' });
    }
    catch (error) {
        resetConnection();
        const message = error instanceof Error ? error.message : 'unknown error';
        res.status(500).json({ ok: false, service: 'backend', database: message });
    }
});
app.get('/api/version', (_req, res) => {
    res.json({ name: 'declarapp-backend', runtime: process.version });
});
app.use('/api/users', usersRouter);
const start = async () => {
    app.listen(port, () => {
        console.log(`Backend listening on http://localhost:${port}`);
    });
    try {
        await connect();
        console.log(`MongoDB connected to ${dbName}`);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'unknown error';
        console.warn(`MongoDB not connected at startup: ${message}`);
    }
};
start().catch((error) => {
    console.error('Failed to start backend:', error);
    process.exit(1);
});
