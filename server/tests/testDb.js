import mongoose from 'mongoose';

const TEST_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ajay-tour-travels-test';

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
