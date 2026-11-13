import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI?.trim();

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB() {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not configured. Set it in the server environment.');
  }

  if (cached.conn?.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        const dbName = mongooseInstance.connection.name;
        const host = mongooseInstance.connection.host;
        console.log('\n======================================================');
        console.log('🍃 [MONGODB STATUS]: CONNECTED SUCCESSFULLY!');
        console.log(`📡 Cluster Host: ${host}`);
        console.log(`🗄️ Database: ${dbName}`);
        console.log('✨ All products, users, orders stored in MongoDB Atlas');
        console.log('======================================================\n');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        console.error('\n======================================================');
        console.error('❌ [MONGODB STATUS]: FAILED TO CONNECT!');
        console.error(`⚠️ Error: ${err.message}`);
        console.error('======================================================\n');
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDbStatus() {
  const connected = isConnected();
  return {
    type: 'MongoDB',
    connected,
    host: connected ? mongoose.connection.host : 'not connected',
    name: connected ? mongoose.connection.name : 'not connected',
  };
}