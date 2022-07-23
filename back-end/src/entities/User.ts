import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity, OneToMany, PrimaryGeneratedColumn,
  UpdateDateColumn
} from "typeorm";
import { Post } from "./Post";
@Entity()
@ObjectType()
export class User extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @OneToMany(() => Post, (post) => post.creator)
  posts: Post[];


  @Column()
  password!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field(() => String)
  @UpdateDateColumn()
  updateAt = new Date();
  @Field()
  @Column({ unique: true })
  username!: string;
}
