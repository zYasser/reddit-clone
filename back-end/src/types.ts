import { Request, Response } from "express";
import { Session, SessionData } from "express-session";
import Redis from "ioredis";

export type MyContext= {
    req: Request & {
        session:Session & Partial<SessionData> & { UserID: number } | any 
      };
        res:Response
        ,
        redis:Redis
        
}