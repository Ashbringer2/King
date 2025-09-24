const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017';
const dbName = 'moneydb';
const collectionName = 'klientet';

async function inspectCollection() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    const documents = await collection.find({}).toArray();
    console.log(`Documents in ${collectionName}:`, documents);
  } catch (err) {
    console.error('Error querying MongoDB:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

inspectCollection();