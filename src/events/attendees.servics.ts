import { InjectRepository } from "@nestjs/typeorm";
import { Attendee } from "./attendee.entity";
import { Repository } from "typeorm";
import { Injectable } from "@nestjs/common";
import { CreateAttendeeDto } from "./input/create-attendee.dto";

@Injectable()
export class AttendeesService {
    constructor(
        @InjectRepository(Attendee)
        private readonly attendeeRepository: Repository<Attendee>
    ){}

    public async findByEventId(eventsId: number): Promise<Attendee[]> {
        return await this.attendeeRepository.find({
            where: {
                event: {id: eventsId}
            }
        });
    }

    public async findOneByEventIdAndUserId(
        eventId: number, userId: number
    ): Promise<Attendee | undefined> {
        return await this.attendeeRepository.findOne({
            where: {
                id: userId,
                eventId: eventId
            }
        })
    }

    public async createOrUpdate(
        input: CreateAttendeeDto,
        eventId: number,
        userId: number
    ): Promise<Attendee> {
        const attendee = await this.findOneByEventIdAndUserId(
            eventId = eventId,
            userId = userId,
        ) ?? new Attendee();

        attendee.eventId = eventId;
        attendee.userId = userId;
        attendee.answer = input.answer; 

        return await this.attendeeRepository.save(attendee);
    }
}