import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Attendee } from "./attendee.entity";
import { User } from "src/auth/user.entity";
import { Expose } from "class-transformer";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Expose()
  name: string;

  @Column()
  @Expose()
  description: string;

  @Column()
  @Expose()
  when: Date;

  @Column()
  @Expose()
  address: string;

  @OneToMany(() => Attendee, (attendee) => attendee.event, {
    cascade: true
  })
  @Expose()
  attendees: Attendee[];

  @ManyToOne(() => User, (user) => user.organized)
  @JoinColumn({ name: 'organizerID' })
  @Expose()
  organizer: User;

  @Column({ nullable: true })
  organizerID: number;

  @Expose()
  attendeeCount?: number;

  @Expose()
  attendeeAccepted?: number;
  @Expose()
  attendeeMaybe?: number;
  @Expose()
  attendeeRejected?: number;
}