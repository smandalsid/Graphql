import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Teacher } from './teacher.entity';
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { Course } from "./course.entity";

@Entity()
@ObjectType()
export class Subject {
  @PrimaryGeneratedColumn()
  @Field()
  id: number;

  @Column()
  @Field()
  name: string;

  @ManyToMany(
    () => Teacher, (teacher) => teacher.subjects, { cascade: true }
  )
  @JoinTable()
  teachers: Promise<Teacher[]>;

  @OneToMany(() => Course, (course) => course.subject)
  @Field(() => [Course], {nullable: true})
  courses: Promise<Course[]>;
}