import argon2 from "argon2";
import { User } from "../entities/User";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { EntityManager } from "@mikro-orm/postgresql";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];
  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length < 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username can not be less than 2 character ",
          },
        ],
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          {
            field: "password",
            message: "password can not be less than 6 character",
          },
        ],
      };
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          update_at: new Date(),
        })
        .returning("*");
      const newUser = result[0];
      user = newUser;
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [{ field: "username", message: "Username already exist" }],
        };
      }
    }
    req.session.UserID = user.id;

    return { user };
  }
  @Mutation(() => UserResponse)
  async deleteUser(
    @Arg("userId") userId: number,
    @Ctx() { em, res }: MyContext
  ): Promise<UserResponse> {
    try {
      const user = await em.findOneOrFail(User, { id: userId });
      await em.removeAndFlush(user);
      return { user };
    } catch {
      res.status(404);
      console.log(res);

      return {
        errors: [
          {
            field: "id",
            message: "There is no user with this id",
          },
        ],
      };
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{ field: "username", message: "That username doesn't exist" }],
      };
    }

    const vaildPassword = await argon2.verify(user.password, options.password);
    if (!vaildPassword) {
      return {
        errors: [
          { field: "password", message: "Incorrect Password Try again" },
        ],
      };
    }
    req.session.UserID = user.id;

    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.UserID) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.UserID });
    return user;
  }
}
