import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver{
  @Query(() => [Post])
   posts(): Promise<Post[]> {
    return Post.find();
  }
  @Query(() => Post, { nullable: true })
  post(
    @Arg("id") id: number,
    
  ): Promise<Post | null> {
    return Post.findOneBy({ id });
  }
  @Mutation(() => Post, { nullable: true })
  async createAPost(
    @Arg("title") title: string,
    
  ): Promise<Post> {
    const post =await Post.create({ title });
    await Post.save(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true }) title: string,

    
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
  async deletePost(
    @Arg("id") id: number,
    
  ): Promise<boolean> {
    try {
      await Post.delete(id);
    } catch {
      return false;
    }
    return true;
  }
}
