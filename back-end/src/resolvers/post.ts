import { isAuth } from "../middleware/auth";
import { MyContext } from "../types";
import { Arg, InputType, Mutation, Query, Resolver,Field, Ctx, UseMiddleware } from "type-graphql";
import { Post } from "../entities/Post";

@InputType()
class PostInput { 
  @Field()
  title:string
  @Field()
  text:string
  
}




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
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() {req}:MyContext
    
  ): Promise<Post> {
    const post =await Post.create({ ...input,creatorId:req.session.userId });
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
