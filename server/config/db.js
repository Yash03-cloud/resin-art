import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isMongoConnected = false;
let mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/resin-art';

export async function connectDB() {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resin';
  const maskedPrimary = primaryUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');

  try {
    // Attempt primary MongoDB connection
    await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 4000,
    });
    isMongoConnected = true;
    mongoUri = primaryUri;
    console.log(`🍃 MongoDB Connected successfully: ${maskedPrimary}`);
    return true;
  } catch (err) {
    console.warn(`⚠️ Primary MongoDB error (${maskedPrimary}): ${err.message}`);

    // If primary was a cloud URI and failed (e.g. Atlas auth failure), attempt local MongoDB fallback
    if (!primaryUri.includes('127.0.0.1') && !primaryUri.includes('localhost')) {
      const localUri = 'mongodb://127.0.0.1:27017/resin';
      try {
        console.log(`🔄 Attempting fallback connection to Local MongoDB: ${localUri}...`);
        await mongoose.connect(localUri, { serverSelectionTimeoutMS: 2000 });
        isMongoConnected = true;
        mongoUri = localUri;
        console.log(`🍃 Fallback to Local MongoDB connected successfully: ${localUri}`);
        return true;
      } catch (_localErr) {
        console.log(`ℹ️ Local MongoDB also not available.`);
      }
    }

    isMongoConnected = false;
    console.log(`ℹ️ Operating in persistent JSON DB fallback mode.`);
    return false;
  }
}

export function isConnected() {
  return isMongoConnected && mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  return {
    type: isConnected() ? 'MongoDB' : 'Local JSON Storage',
    connected: isConnected(),
    uri: isConnected() ? mongoUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : null,
    host: isConnected() ? mongoose.connection.host : 'localhost',
    name: isConnected() ? mongoose.connection.name : 'database.json',
  };
}
