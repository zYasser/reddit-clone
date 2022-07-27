import argon2 from "argon2";
import { MyContext } from "src/types";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { v4 } from "uuid";
import { FORGET_PASSWORD_PREFIX } from "../constants";
import { User } from "../entities/User";
import { RegisterValidate } from "../utils/RegisterValidate";
import sendEmail from "../utils/sendEmail";
import { UsernamePasswordInput } from "../utils/UsernamePasswordInput";
import { UserResponse } from "../utils/UserResponse";

@Resolver(User)
export class UserResolver {
  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //if it is the current user then show them their email
    if (req.session.id === user.id) {
      return user.email;
    } else {
      return "";
    }
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: String,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 3) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "password can not be less than 6 character",
          },
        ],
      };
    }

    let userId = await redis.get(FORGET_PASSWORD_PREFIX + token);
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token is expired ",
          },
        ],
      };
    }
    const userIdNum = parseInt(userId);
    const user = await User.findOneBy({ id: userIdNum });
    if (!user) {
      return {
        errors: [
          {
            field: "token",
            message: "account no longer exist ",
          },
        ],
      };
    }

    await User.update(
      { id: userIdNum },
      {
        password: await argon2.hash(newPassword),
      }
    );
    redis.del(FORGET_PASSWORD_PREFIX + token);

    return { user };
  }

  @Mutation(() => Boolean)
  async forgetPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOneBy({ email });
    if (!user) {
      return true;
    }
    const token = v4();

    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      "EX",
      1000 * 60 * 60 * 24 * 3
    );
    await sendEmail(
      email,
      `
    <a href="http://localhost:3000/change-password/${token}">reset your password</a>
    `
    );
    return true;
  }

  @Mutation(() => UserResponse, { nullable: true })
  async register(
    @Arg("options") options: UsernamePasswordInput
  ): Promise<UserResponse> {
    const response = RegisterValidate(options);

    if (response.errors != null) {
      console.log("error");

      return response;
    }
    const hashedPassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await User.createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            username: options.username,
            email: options.email,
            password: hashedPassword,
          },
        ])
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      if (err.code === "23505") {
        return {
          errors: [{ field: "username", message: "Username already exist" }],
        };
      }
    }

    return { user };
  }
  @Mutation(() => UserResponse)
  async deleteUser(
    @Arg("userId") userId: number,
    @Ctx() { res }: MyContext
  ): Promise<UserResponse> {
    try {
      const user = await User.findOneByOrFail({
        id: userId,
      });
      await User.remove(user);
      return { user };
    } catch {
      res.status(404);

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
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOneBy(
      usernameOrEmail.includes("@")
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );

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
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }
    const user = await User.findOneBy({
      id: req.session.userId,
    });
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
