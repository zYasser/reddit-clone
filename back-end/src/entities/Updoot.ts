import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column, Entity,
  ManyToOne,
  PrimaryColumn
} from "typeorm";
import { Post } from "./Post";
import { User } from "./User";

@Entity()
export class Updoot extends BaseEntity {
  @Column({type:'int'})
  value:number


  @Column()
  @PrimaryColumn()
  userId: number;
  @Field(()=> User)
  @ManyToOne(() => User, (user) => user.updoots)
  user: User;

  @Column()
  @PrimaryColumn()
  postId: number;

  @ManyToOne(() => Post, (post) => post.updoots)
  post: Post;
}
