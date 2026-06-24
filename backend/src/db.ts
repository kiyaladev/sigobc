import mongoose from 'mongoose';

const mongoUri =
  process.env.MONGODB_URI ?? `mongodb://127.0.0.1:27017/${process.env.MONGODB_DB ?? 'declarapp'}`;

export const connect = async (): Promise<void> => {
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(mongoUri);
};

export const disconnect = async (): Promise<void> => {
  await mongoose.disconnect();
};

/** Auto-increment integer ID per collection, stored in `_counters`. */
export const getNextId = async (collectionName: string): Promise<number> => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const col = mongoose.connection.collection('_counters') as any;
  const result = (await col.findOneAndUpdate(
    { _id: collectionName },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: 'after' },
  )) as { seq: number };
  return result.seq;
};
