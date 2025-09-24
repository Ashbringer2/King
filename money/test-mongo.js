// test-mongo.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/moneydb';
const client = new MongoClient(uri, { useUnifiedTopology: true });

async function run() {
  try {
    await client.connect();
    const admin = client.db().admin();
    const res = await admin.ping();
    console.log('Mongo ping result:', res);
  } catch (err) {
    console.error('Mongo connection error:', err);
  } finally {
    await client.close();
  }
}

run();