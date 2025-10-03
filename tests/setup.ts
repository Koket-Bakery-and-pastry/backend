// If using Jest, ensure the following comment is present for type support
// @jest-environment node

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_SECRET = "testsecret";
  process.env.NODE_ENV = "test";

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri);
});

beforeEach(async () => {
  const db = mongoose.connection.db;
  if (!db) {
    throw new Error("Database connection is not established.");
  }
  const collections = await db.collections();

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  if (mongo) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongo.stop();
  }
});
