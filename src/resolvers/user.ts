import { RequiredEntityData } from "@mikro-orm/core";
import argon2  from "argon2";
import { User } from "src/entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, Query, Resolver } from "type-graphql";

@InputType()
class UsernamePasswordInput{
@Field()
username:string
@Field()
password:string
}


@Resolver()
export class UserResolver{




@Mutation(()=>User,{nullable:true})
async register(
    @Arg("options") options:UsernamePasswordInput,
    @Ctx(){em}:MyContext
){
    const hashedPassword=await argon2.hash(options.password)
    const user=em.create(User,{username:options.username, password:hashedPassword} as RequiredEntityData<User>)
    await em.persistAndFlush(user)
    return user; 
}

}