import { Updoot } from "../entities/Updoot";
import {
  Arg,
  Ctx,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { getConnection } from "typeorm";
import { Post } from "../entities/Post";
import { isAuth } from "../middleware/auth";
import { MyContext } from "../types";
import { User } from "../entities/User";

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}
@ObjectType()
class PaginatedPost {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(@Root() root: Post) {
    return root.text.slice(0, 50);
  }

  @FieldResolver(() => User)
  creator(@Root() post: Post, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(post.creatorId);
  }
  @FieldResolver(() => Int, { nullable: true })
  async voteStatus(@Root() post: Post, @Ctx() { voteLoader, req }: MyContext) {
    if(!req.session.userId){
      return null;
    }
    const updoot = await voteLoader.load({
      postId: post.id,
      userId: req.session.userId,
    });
    return updoot ? updoot.value : null
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async vote(
    @Arg("postId", () => Int) postId: number,
    @Arg("value", () => Int) value: number,
    @Ctx() { req }: MyContext
  ): Promise<Boolean> {
    const isUpVote = value !== -1;
    const realValue = isUpVote ? 1 : -1;
    const { userId } = req.session;

    const updoot = await Updoot.findOne({ where: { postId, userId } });
    if (updoot && updoot.value !== realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        Update updoot SET value = $1 WHERE "postId"= $2 AND "userId" = $3
        `,
          [realValue, postId, userId]
        );
        await tm.query(
          `Update post 
          SET points=points + $1
          WHERE id =$2;
  `,
          [2 * realValue, postId]
        );
      });
    } else if (updoot && updoot.value === realValue) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
          DELETE FROM Updoot WHERE "postId"= $1 AND "userId" = $2
          `,
          [postId, userId]
        );
        await tm.query(
          `Update post 
            SET points=points + ${realValue === 1 ? -1 : 1}
            WHERE id =${postId};
    `
        );
      });
    } else if (!updoot) {
      await getConnection().transaction(async (tm) => {
        await tm.query(
          `
        INSERT INTO updoot("userId" , "postId" , value) values($1, $2 , $3);
        `,
          [userId, postId, realValue]
        );
        await tm.query(
          `Update post 
          SET points=points + $1
          WHERE id =$2;
  `,
          [realValue, postId]
        );
      });
    }

    return true;
  }
  @Query(() => PaginatedPost)
  async posts(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPost> {
    const realLimit = Math.min(50, limit);
    const hasMorePost = realLimit + 1;
    const replacement: any[] = [hasMorePost];

    if (cursor) {
      replacement.push(new Date(parseInt(cursor)));
    }
    const qb = await getConnection().query(
      `SELECT p.* 
      FROM POST P 
    INNER JOIN "user" u ON P."creatorId"=u.id ${
      cursor ? `where P."createdAt" < $2` : ""
    }ORDER BY p."createdAt" DESC Limit $1`,
      replacement
    );

    return {
      posts: qb.slice(0, realLimit),
      hasMore: qb.length === hasMorePost,
    };
  }
  @Query(() => Post, { nullable: true })
  post(@Arg("id", () => Int) id: number): Promise<Post | null> {
    return Post.findOne({ where: { id }, relations: ["creator"] });
  }
  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req }: MyContext
  ): Promise<Post> {
    const post = await Post.create({ ...input, creatorId: req.session.userId });
    await Post.save(post);
    return post;
  }
  @UseMiddleware(isAuth)
  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title", () => String, { nullable: true }) title: string,
    @Arg("text", () => String, { nullable: true }) text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
    }
    if (typeof text !== "undefined") {
      post.text = text;
    }

    const res = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ text, title })
      .where(`id = :id and "creatorId" = :creatorId`, {
        id,
        creatorId: req.session.userId,
      })
      .returning("*")
      .execute();
    return res.raw[0];
  }
  @UseMiddleware(isAuth)
  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return false;
    }
    if (post?.creatorId !== req.session.userId) {
      throw new Error("not Authorized");
    }
    try {
      await getConnection().transaction(async (tm) => {
        await tm.query(`DELETE FROM Updoot WHERE "postId" = $1`, [id]);
        await tm.query(`DELETE FROM post Where id=$1 AND "creatorId"=$2`, [
          id,
          req.session.userId,
        ]);
      });
    } catch (e) {
      console.log(e);

      return false;
    }

    return true;
  }
}
