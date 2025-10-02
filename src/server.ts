import { Env } from "./config/env";
import { connectDB } from "./database/models";
import app from "./app";

const start = async () => {
  await connectDB();
  app.listen(Env.PORT, () =>
    console.log(`🚀 Server running on port ${Env.PORT}`)
  );
};

start();
