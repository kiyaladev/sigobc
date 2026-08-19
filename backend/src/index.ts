import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import { connect } from './db.js';
import { MODEL_REGISTRY } from './models/index.js';
import { makeCrudRouter } from './routes/crud.js';
import { runSeeders } from './seed.js';

dotenv.config();

const port = Number(process.env.PORT ?? 4000);

const app = express();
app.use(cors());
// Les imports en masse (déclarations et mandats extraits des PDF) postent des
// tableaux entiers sur `/bulk` : la limite express par défaut (100 kb) les
// rejetait en 413 dès quelques centaines de lignes.
app.use(express.json({ limit: '25mb' }));

// ─── utility routes ──────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  const state = mongoose.connection.readyState;
  if (state === 1) {
    res.json({ ok: true, service: 'backend', database: 'connected' });
  } else {
    res.status(503).json({ ok: false, service: 'backend', database: 'disconnected' });
  }
});

app.get('/api/version', (_req, res) => {
  res.json({ name: 'declarapp-backend', runtime: process.version });
});

// ─── CRUD routes (one per collection) ────────────────────────────────────────

for (const [name, collectionModel] of Object.entries(MODEL_REGISTRY)) {
  app.use(`/api/${name}`, makeCrudRouter(collectionModel, name));
}

// ─── startup ─────────────────────────────────────────────────────────────────

const start = async (): Promise<void> => {
  app.listen(port, () => {
    console.log(`Backend listening on http://localhost:${port}`);
  });

  try {
    await connect();
    console.log('MongoDB connected');
    await runSeeders();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    console.warn(`MongoDB not connected at startup: ${message}`);
  }
};

start().catch((error) => {
  console.error('Failed to start backend:', error);
  process.exit(1);
});
