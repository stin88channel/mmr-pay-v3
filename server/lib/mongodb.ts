import { MongoClient } from 'mongodb';

if (!process.env.MONGO_URL) {
  throw new Error('MONGO_URL не найден в переменных окружения');
}

const uri = process.env.MONGO_URL;
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development') {
  // В режиме разработки используем глобальную переменную
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // В продакшене создаем новый клиент
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export { clientPromise }; 