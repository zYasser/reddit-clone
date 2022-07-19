import { EntityManager } from "@mikro-orm/postgresql";
import argon2 from "argon2";
import { MyContext } from "src/types";
import { RegisterValidate } from "../utils/RegisterValidate";
import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import { User } from "../entities/User";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { UserResponse } from "../utils/UserResponse";

@Resolver()
export class UserResolver {
  @Mutation(() => Boolean)
  async forgetPasswor(@Arg("email") email: string, @Ctx() { em }: MyContext) {
    // const user = em.findOne(User, { email });

    return true;
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const response = RegisterValidate(options);

    if (response.errors != null) {
      console.log("error");

      return response;
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
          email: options.email,
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
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    console.log(user, usernameOrEmail);

    if (!user) {
      return {
        errors: [
          {
            field: "userNameOrEmail",
            message: "That username or email doesn't exist",
          },
        ],
      };
    }

    const vaildPassword = await argon2.verify(user.password, password);
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
  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err: any) => {
        res.clearCookie("qid");
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
