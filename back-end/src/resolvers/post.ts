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
      `SELECT p.* , 
      json_build_object(
        'id',u.id,
        'username',u.username,
        'email',u.email
      ) creator,
      ${
        req.session.userId
          ? `(SELECT VALUE FROM updoot where "userId" = ${req.session.userId} and "postId"= p.id) "voteStatus"`
          : `null as "voteStatus"`
      }
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
  post(@Arg("id") id: number): Promise<Post | null> {
    return Post.findOneBy({ id });
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

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string
  ): Promise<Post | null> {
    const post = await Post.findOneBy({ id });
    if (!post) {
      return null;
    }
    if (typeof title !== "undefined") {
      post.title = title;
      await Post.update({ id }, { title });
    }

    return post;
  }
  @Mutation(() => Boolean)
  async deletePost(@Arg("id") id: number): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }
    return true;
  }
}
