import { MongoClient } from 'mongodb';
const mongoUri = process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017';
export const dbName = process.env.MONGODB_DB ?? 'declarapp';
export const client = new MongoClient(mongoUri);
let connected = false;
export const connect = async () => {
    if (connected)
        return;
    await client.connect();
    connected = true;
};
export const resetConnection = () => {
    connected = false;
};
export const db = () => client.db(dbName);
