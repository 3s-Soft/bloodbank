import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
}

// Safeguard: Encode common special characters in password if they appear unencoded in a mongodb+srv string
// This fixes the case where a password like "P@ssword" makes the driver think "ssword" is the host.
function sanitizeConnectionURI(uri: string): string {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const parts = uri.replace("mongodb+srv://", "").split("@");
  if (parts.length > 2) {
    // If there are multiple @, the last one is the actual separator between credentials and host
    const hostPart = parts.pop();
    const credentialPart = parts.join("%40"); // Re-encode the internal @ symbols
    return `mongodb+srv://${credentialPart}@${hostPart}`;
  }
  return uri;
}

const sanitizedUri = sanitizeConnectionURI(MONGODB_URI);

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections from growing exponentially
 * during API Route usage.
 */
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(sanitizedUri, opts).then((mongoose) => {
      return mongoose;
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

export default connectToDatabase;
