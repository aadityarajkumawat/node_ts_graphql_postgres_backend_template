import "reflect-metadata";
import { createConnection } from "typeorm";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import cors from "cors";
import { DB_URL, FRONTEND_URL } from "./constants/urls";

const main = async () => {
  await createConnection({
    type: "postgres",
    url: DB_URL,
    entities: [],
    logging: true,
    // synchronize: true,
  });

  const app = express();

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
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
