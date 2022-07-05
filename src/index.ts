import {MikroORM, RequiredEntityData} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/post";
import microConfig from "./mikro-orm.config"
const main=async () => {
    
    const orm= await MikroORM.init(microConfig);

    await orm.getMigrator().up();   
    const post = orm.em.fork({}).create(Post, {
        title: 'my first post',
      } as RequiredEntityData<Post>)
      await orm.em.persistAndFlush(post)    // console.log('------------SQL 2-------------');
    // await orm.em.nativeInsert(Post,{title:"Second Post"})
    
    
    

}
main().catch(e=>console.error(e)
)
console.log("Hello World");
