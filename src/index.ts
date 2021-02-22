import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import { DB_URL, FRONTEND_URL, __prod__ } from "./constants/urls";
import connectRedis from "connect-redis";
import session from "express-session";
import redis from "redis";

const main = async () => {
  await createConnection({
    type: "postgres",
    url: DB_URL,
    entities: [],
    logging: true,
    // synchronize: true,
  });

  const app = express();

  const RedisStore = connectRedis(session);
  const redisClient = redis.createClient();

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    })
  );

  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 12 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax",
        secure: __prod__,
      },
      saveUninitialized: false,
      secret: "thisissomerandomwhichbecomesusajibrish",
      resave: false,
    })
  );

  const server = new ApolloServer({
    schema: await buildSchema({
      resolvers: [""],
      validate: false,
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  server.applyMiddleware({ app, cors: false });

  const PORT = process.env.PORT || 4000;

  app.listen(PORT, () => console.log(`server is running on port ${PORT}`));
};

main().catch((err) => {
  console.log(err.message);
});
