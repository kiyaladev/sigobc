import { Router } from 'express';
import { ObjectId } from 'mongodb';
import { connect, db, resetConnection } from '../db.js';
const collectionName = process.env.MONGODB_USERS_COLLECTION ?? 'users';
const col = () => db().collection(collectionName);
const router = Router();
const withMongo = async (res, handler) => {
    try {
        await connect();
        await handler();
    }
    catch (error) {
        resetConnection();
        const message = error instanceof Error ? error.message : 'unknown error';
        res.status(500).json({ ok: false, error: message });
    }
};
router.get('/', async (_req, res) => {
    await withMongo(res, async () => {
        const users = await col().find().sort({ createdAt: -1 }).limit(100).toArray();
        res.json({ ok: true, data: users });
    });
});
router.post('/', async (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        res.status(400).json({ ok: false, error: 'name and email are required' });
        return;
    }
    await withMongo(res, async () => {
        const payload = {
            name: String(name).trim(),
            email: String(email).trim().toLowerCase(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await col().insertOne(payload);
        res.status(201).json({ ok: true, id: result.insertedId, data: payload });
    });
});
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        res.status(400).json({ ok: false, error: 'invalid user id' });
        return;
    }
    await withMongo(res, async () => {
        const user = await col().findOne({ _id: new ObjectId(id) });
        if (!user) {
            res.status(404).json({ ok: false, error: 'user not found' });
            return;
        }
        res.json({ ok: true, data: user });
    });
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    if (!ObjectId.isValid(id)) {
        res.status(400).json({ ok: false, error: 'invalid user id' });
        return;
    }
    if (!name && !email) {
        res.status(400).json({ ok: false, error: 'at least name or email is required' });
        return;
    }
    await withMongo(res, async () => {
        const updates = { updatedAt: new Date() };
        if (name)
            updates['name'] = String(name).trim();
        if (email)
            updates['email'] = String(email).trim().toLowerCase();
        const result = await col().findOneAndUpdate({ _id: new ObjectId(id) }, { $set: updates }, { returnDocument: 'after' });
        if (!result) {
            res.status(404).json({ ok: false, error: 'user not found' });
            return;
        }
        res.json({ ok: true, data: result });
    });
});
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
        res.status(400).json({ ok: false, error: 'invalid user id' });
        return;
    }
    await withMongo(res, async () => {
        const result = await col().deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            res.status(404).json({ ok: false, error: 'user not found' });
            return;
        }
        res.json({ ok: true, deletedCount: result.deletedCount });
    });
});
export default router;
