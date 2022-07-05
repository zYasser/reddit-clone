import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import { MikroORM } from "@mikro-orm/core";
import path from 'path'
export default{
    migrations:{
        path: path.join(__dirname,'./migrations'),
        glob: '!(*.d).{js,ts}',

    },
    

    forceUtcTimezone: true,
    allowGlobalContext:true,
    entities:[Post],
    dbName:"reddit-clone",
    type:"postgresql",
    debug:!__prod__
} as Parameters<typeof MikroORM.init>[0];

/*
Here we need to cast it into Parameters because we don't want to make dbName as String it should be type of dbName not a name
*/