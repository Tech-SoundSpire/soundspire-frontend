import React from 'react';
import { initSchemas } from '@/lib/initSchemas';
import { establishConnection } from '@/lib/dbConfig';
export async function connectionTestingAndHelper(){
try {
  await establishConnection();
  await initSchemas();
} catch (error) {
  console.log(error);
}
}