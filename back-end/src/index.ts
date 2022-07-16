import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConfig from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import session from "express-session";
import connectRedis from "connect-redis";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";

const main = async () => {
  const orm = await MikroORM.init(microConfig);

  await orm.getMigrator().up();
  const app = express();

  const { createClient } = require("redis");
  let redisClient = createClient({ legacyMode: true });
  redisClient.connect().catch(console.error);
  const RedisStore = connectRedis(session);

  
  app.use(
    session({
      name: "qid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
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
    context: ({ req, res }) => ({ em: orm.em, req, res }), //This will help us to access everything we passed here to all our's resolver
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors:{
    origin:['http://localhost:3000',],
    credentials:true
  } });
  app.listen(4000, () => {
    console.log("server started on port 4000");
  });
};
main().catch((e) => console.error(e));
