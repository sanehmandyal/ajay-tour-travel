import mongoose from 'mongoose';

const TEST_URI = process.env.TEST_MONGODB_URI || 'mongodb://127.0.0.1:27017/ajay-tour-travels-test';

export async function connectTestDb() {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(TEST_URI, { serverSelectionTimeoutMS: 5000 });
  }
  return null;
}

export async function disconnectTestDb() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  } catch {}
}
