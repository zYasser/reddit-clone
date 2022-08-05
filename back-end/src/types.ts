import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import Redis from "ioredis";
import { createUserLoader } from "./utils/createUserLoader";
import { createVoteLoader } from "./utils/createVoteLoader";

export type MyContext = {
  req: Request & {
    session: (Session & Partial<SessionData> & { UserID: number }) | any;
  };
  res: Response;
  redis: Redis;
  userLoader: ReturnType<typeof createUserLoader>;
  voteLoader: ReturnType<typeof createVoteLoader>;
};
