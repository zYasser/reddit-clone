import { Field, ObjectType } from "type-graphql";
import { PrimaryGeneratedColumn,Entity, Column, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";


@Entity()
@ObjectType()
export class Post extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;
  @Field(()=>String)
  @CreateDateColumn()
  createdAt = new Date();
  @Field(()=>String)
  @UpdateDateColumn()
  updateAt = new Date();
  @Column()
  @Field()
  title!: string;
}
