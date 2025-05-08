import type { NextApiRequest, NextApiResponse } from 'next';
import { clientPromise } from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('🔄 Attempting to connect to MongoDB...');
  
  try {
    const client = await clientPromise;
    console.log('✅ MongoDB client connected successfully');
    
    const db = client.db("mmr-pay");
    console.log('📦 Connected to database:', db.databaseName);
    
    // Проверяем доступные коллекции
    const collections = await db.listCollections().toArray();
    console.log('📚 Available collections:', collections.map(c => c.name).join(', '));
    
    res.status(200).json({ 
      message: "MongoDB connection successful",
      database: db.databaseName,
      collections: collections.map(c => c.name)
    });
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    res.status(500).json({ 
      error: "Failed to connect to MongoDB",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
} 