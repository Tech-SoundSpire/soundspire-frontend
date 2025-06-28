import { initSchemas } from '@/lib/initSchemas';
import { establishConnection } from '@/lib/dbConfig';
export async function connectionTestingAndHelper(){
try {
  await establishConnection();
  await initSchemas();
} catch (error) {
  console.error("❌ Database connection failed:", error);
    throw new Error("Database connection failed");
}
}