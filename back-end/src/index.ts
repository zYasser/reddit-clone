import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { ApolloServer } from "apollo-server-express";
import connectRedis from "connect-redis";
import express from "express";
import session from "express-session";
import Redis from "ioredis";
import path from "path";
import "reflect-metadata";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";
import { COOKIE_NAME } from "./constants";
import { Post } from "./entities/Post";
import { Updoot } from "./entities/Updoot";
import { User } from "./entities/User";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoader } from "./utils/createVoteLoader";
const main = async () => {
  const appDataSource = await createConnection({
    type: "postgres",
    host: "localhost",
    database: "reddit",
    username: "postgres",
    password: "root",
    logging: true,
    synchronize: true,
    migrations: {
      path: path.join(__dirname, "./migrations/"),
      glob: "!(*.d).{js,ts}",
    },
    entities: [Post, User, Updoot],
    port: 5432,
  });

  const app = express();
  const redis = new Redis();

  const RedisStore = connectRedis(session);

  app.use(
    session({
      name: COOKIE_NAME,
      store: new RedisStore({ client: redis, disableTouch: true }),
      saveUninitialized: false,
      secret: "keyboard cat",
      resave: false,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30 * 365 * 10,
        httpOnly: true,
        secure: false,
        sameSite: "lax",
      },
    })
  );

  const apolloServer = new ApolloServer({
    plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }) => ({
      req,
      res,
      redis,
      appDataSource,
      userLoader: createUserLoader(),
      voteLoader:createVoteLoader()
    }), //This will help us to access everything we passed here to all our's resolver
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({
    app,
    cors: {
      origin: ["http://localhost:3000"],
      credentials: true,
    },
  });
  app.listen(4000, () => {
    console.log("server started on port 4000");
  });
};
main().catch((e) => console.error(e));
