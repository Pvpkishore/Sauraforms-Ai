import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  // Not an error — MongoDB is optional. The app falls back to localStorage.
}

// Use a module-level cached connection so Next.js hot-reloads don't exhaust
// the connection pool during development.
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = global as typeof global & { _mongooseCache?: MongooseCache };

if (!globalWithMongoose._mongooseCache) {
  globalWithMongoose._mongooseCache = { conn: null, promise: null };
}

const cache = globalWithMongoose._mongooseCache;

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is not set.");
  }

  if (cache.conn) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        maxPoolSize: 10
      })
      .then((mongooseInstance) => {
        cache.conn = mongooseInstance;
        return mongooseInstance;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export const isMongoConfigured = (): boolean => Boolean(MONGODB_URI);
