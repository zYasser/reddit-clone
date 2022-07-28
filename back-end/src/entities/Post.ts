import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Updoot } from "../entities/Updoot";
import { User } from "../entities/User";

@Entity()
@ObjectType()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  @Field()
  @Column()
  creatorId: number;
  @Field(() => User)
  @ManyToOne(() => User, (creator) => creator.posts)
  creator: User;
  @OneToMany(() => Updoot, (updoots) => updoots.post)
  updoots: Updoot[];

  @Column()
  @Field()
  title!: string;
  @Column()
  @Field()
  text!: string;

  @Field(() => Int , {nullable: true})
  voteStatus?: number | null;

  @Column({ type: "int", default: 0 })
  @Field()
  points!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt = new Date();

  @Field(() => String)
  @UpdateDateColumn()
  updateAt = new Date();
}
