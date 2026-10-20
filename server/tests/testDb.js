import mongoose from 'mongoose';
import fs from 'node:fs';

const TEST_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ajay-tour-travels-test';
const LOCAL_MONGOD = 'C:\\Program Files\\MongoDB\\Server\\8.2\\bin\\mongod.exe';
if (!process.env.MONGOMS_SYSTEM_BINARY && fs.existsSync(LOCAL_MONGOD)) {
  process.env.MONGOMS_SYSTEM_BINARY = LOCAL_MONGOD;
}

let sharedMongod = null;

export async function connectTestDb() {
  if (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 1500 });
      return null;
    } catch {
      if (!sharedMongod) {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        sharedMongod = await MongoMemoryServer.create({ instance: { startupTimeout: 60000 } });
      }
      await mongoose.connect(sharedMongod.getUri());
      return sharedMongod;
    }
  }
  return sharedMongod;
}

export async function disconnectTestDb() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {}
}
