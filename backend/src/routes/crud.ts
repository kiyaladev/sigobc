import type { Request, Response } from 'express';
import { Router } from 'express';
import type { Model } from 'mongoose';
import { getNextId } from '../db.js';

// ─── helpers ────────────────────────────────────────────────────────────────

function toPayload(doc: Record<string, unknown>): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _id, __v, ...rest } = doc;
  return rest;
}

/**
 * Converts query-string values to numbers when they are numeric strings,
 * leaving everything else as-is. Skips keys that start with `_`.
 */
function buildFilter(query: Request['query']): Record<string, unknown> {
  const filter: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(query)) {
    if (key.startsWith('_')) continue;
    if (typeof val === 'string') {
      const n = Number(val);
      filter[key] = val !== '' && !isNaN(n) ? n : val;
    } else {
      // array / undefined - pass as-is
      filter[key] = val;
    }
  }
  return filter;
}

function sendError(res: Response, error: unknown, status = 500): void {
  const message = error instanceof Error ? error.message : 'unknown error';
  res.status(status).json({ ok: false, error: message });
}

// ─── factory ─────────────────────────────────────────────────────────────────

export function makeCrudRouter(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collectionModel: Model<any>,
  collectionName: string,
): Router {
  const router = Router();

  // GET /count
  router.get('/count', async (req, res) => {
    try {
      const count = await collectionModel.countDocuments(buildFilter(req.query));
      res.json({ ok: true, count });
    } catch (e) {
      sendError(res, e);
    }
  });

  // GET / — list with optional filtering + sorting + pagination
  router.get('/', async (req, res) => {
    try {
      const { _sort, _limit, _skip } = req.query;
      const filter = buildFilter(req.query);

      let q = collectionModel.find(filter).select('-__v');
      if (_sort) q = q.sort(String(_sort));
      if (_skip) q = q.skip(Number(_skip));
      q = q.limit(_limit ? Math.min(Number(_limit), 5000) : 5000);

      const docs = await q.lean<Record<string, unknown>[]>();
      res.json({ ok: true, data: docs.map(toPayload) });
    } catch (e) {
      sendError(res, e);
    }
  });

  // POST /bulk — insert many
  router.post('/bulk', async (req, res) => {
    try {
      const items = (req.body as unknown[]) ?? [];
      if (!Array.isArray(items)) {
        res.status(400).json({ ok: false, error: 'body must be an array' });
        return;
      }
      const withIds = await Promise.all(
        items.map(async (item) => {
          const id = await getNextId(collectionName);
          return { ...(item as object), id };
        }),
      );
      await collectionModel.insertMany(withIds);
      res.status(201).json({ ok: true, ids: withIds.map((d) => (d as { id: number }).id) });
    } catch (e) {
      sendError(res, e);
    }
  });

  // PUT /bulk — upsert many
  router.put('/bulk', async (req, res) => {
    try {
      const items = (req.body as unknown[]) ?? [];
      if (!Array.isArray(items)) {
        res.status(400).json({ ok: false, error: 'body must be an array' });
        return;
      }
      await Promise.all(
        items.map(async (item) => {
          const id = (item as { id?: number }).id;
          if (id) {
            await collectionModel.updateOne({ id }, { $set: item as object });
          } else {
            const newId = await getNextId(collectionName);
            await collectionModel.create({ ...(item as object), id: newId });
          }
        }),
      );
      res.json({ ok: true });
    } catch (e) {
      sendError(res, e);
    }
  });

  // GET /:id
  router.get('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ ok: false, error: 'invalid id' });
        return;
      }
      const doc = await collectionModel
        .findOne({ id })
        .select('-__v')
        .lean<Record<string, unknown>>();
      if (!doc) {
        res.status(404).json({ ok: false, error: 'not found' });
        return;
      }
      res.json({ ok: true, data: toPayload(doc) });
    } catch (e) {
      sendError(res, e);
    }
  });

  // POST / — create one
  router.post('/', async (req, res) => {
    try {
      const id = await getNextId(collectionName);
      const doc = await collectionModel.create({ ...(req.body as object), id });
      res.status(201).json({ ok: true, id, data: toPayload(doc.toObject()) });
    } catch (e) {
      sendError(res, e);
    }
  });

  // PUT /:id — update one
  router.put('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ ok: false, error: 'invalid id' });
        return;
      }
      const doc = await collectionModel
        .findOneAndUpdate({ id }, { $set: req.body as object }, { new: true })
        .select('-__v')
        .lean<Record<string, unknown>>();
      if (!doc) {
        res.status(404).json({ ok: false, error: 'not found' });
        return;
      }
      res.json({ ok: true, data: toPayload(doc) });
    } catch (e) {
      sendError(res, e);
    }
  });

  // DELETE /:id
  router.delete('/:id', async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        res.status(400).json({ ok: false, error: 'invalid id' });
        return;
      }
      const result = await collectionModel.deleteOne({ id });
      if (result.deletedCount === 0) {
        res.status(404).json({ ok: false, error: 'not found' });
        return;
      }
      res.json({ ok: true });
    } catch (e) {
      sendError(res, e);
    }
  });

  return router;
}
