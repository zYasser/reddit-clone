import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core"
import { Request,Response,Express } from "express"
import { Session, SessionData } from "express-session";
export type MyContext= {
    em:EntityManager<IDatabaseDriver<Connection>>
    req: Request & {
        session: Session & Partial<SessionData> & { UserID: number };
      };
        res:Response
}