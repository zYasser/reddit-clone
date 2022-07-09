import { RequiredEntityData } from "@mikro-orm/core";
import argon2  from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import { errors } from "puppeteer";

@InputType()
class UsernamePasswordInput{
@Field()
username:string
@Field()
password:string
}
@ObjectType()
class UserResponse{
    
    @Field(()=> [FieldError], {nullable:true})
    errors?:FieldError[]
    @Field(()=> User ,{nullable:true})
    user?:User 
}

@ObjectType()
class FieldError{
    @Field()
    field:string
    @Field()
    message:string
}


@Resolver()
export class UserResolver{




@Mutation(()=>UserResponse,{nullable:true})
async register(
    @Arg("options") options:UsernamePasswordInput,
    @Ctx(){em}:MyContext
):Promise<UserResponse>{
    if(options.username.length<2){
       return{ errors:[{field:'username',message:"username can not be less than 2 character "}]}
 
    }
    if(options.password.length<=5){
        return{ errors:[{field:'password',message:"password can not be less than 6 character"}]}

    }
    const hashedPassword=await argon2.hash(options.password)
    const user=em.create(User,{username:options.username, password:hashedPassword} as RequiredEntityData<User>)
    try{
        await em.persistAndFlush(user)
    }catch(err){
        if(err.code==='23505' || err.detail.includes('already exists')){
            return{ errors:[{field:'username',message:"Username already exist"}]}
        }
    }
    return {user}; 
}


@Mutation(()=>UserResponse)
async login(
    @Arg("options") options:UsernamePasswordInput,
    @Ctx(){em}:MyContext
):Promise<UserResponse>{



    const user=await em.findOne(User, {username:options.username})
    if(!user){
        return {
            errors:[{field:'username',message:"That username doesn't exist"}]
        }
    }
    

    const vaildPassword=await argon2.verify(user.password,options.password)
    if(!vaildPassword){
        return {
            errors:[{field:'password',message:"Incorrect Password Try again"}]
        }

    }
    return {
        user
    }
}




}