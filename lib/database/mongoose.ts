import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Augment the global namespace to include mongoose
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseConnection | undefined;
}

// Use a global variable to cache the Mongoose connection in serverless environments
let cached: MongooseConnection = global.mongoose || { conn: null, promise: null };

// Cache the connection in the global object
if (!global.mongoose) {
  global.mongoose = cached;
}

export const connectToDatabase = async (): Promise<Mongoose> => {
  // If the connection is already established, return it
  if (cached.conn) return cached.conn;

  if (!MONGODB_URL) {
    throw new Error('Missing MONGODB_URL');
  }

  // If a promise to connect already exists, use it
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URL, {
      dbName: 'imaginify',
      bufferCommands: false,
    }).then((mongoose) => {
      return mongoose;
    });
  }

  // Wait for the promise to resolve and cache the connection
  cached.conn = await cached.promise;
  return cached.conn;
};
