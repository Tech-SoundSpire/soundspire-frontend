import { initSchemas } from '@/lib/initSchemas';
import { establishConnection } from '@/lib/dbConfig';

let connectionInitialized = false;

export async function connectionTestingAndHelper(){
try {
  await establishConnection();
  
  // Only sync schemas once at startup if SYNC_DB is enabled
  // This prevents expensive sync operations on every API request
  if (!connectionInitialized) {
    await initSchemas();
    connectionInitialized = true;
  }
} catch (error) {
  console.error("❌ Database connection failed:", error);
    throw new Error("Database connection failed");
}
}

