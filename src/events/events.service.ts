import { DeleteResult, Repository } from "typeorm";
import { Event } from "./event.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Injectable, Logger } from "@nestjs/common";
import { AttendeeAnswerEnum } from "./attendee.entity";
import { ListEvents, WhenEventFilter } from "./input/list.events";
import { paginate, PaginateOptions } from "src/pagination/paginator";
import { CreateEventDto } from "./input/create-event.dto";
import { User } from "src/auth/user.entity";
import { UpdateEventDto } from "./input/udpate-event.dto";

@Injectable()
export class EventsService {
    private readonly logger = new Logger(EventsService.name);

    constructor(
        @InjectRepository(Event)
        private readonly eventsRepository: Repository<Event>
    ) {}

    private getEventsBaseQuery() {
        return this.eventsRepository
            .createQueryBuilder('e')
            .orderBy('e.id', 'DESC');
    }

    public getEventsWithAttendeeCountQuery() {
        return this.getEventsBaseQuery()
        .loadRelationCountAndMap(
            'e.attendeeCount', 'e.attendees'
        )
        .loadRelationCountAndMap(
            'e.attendeeAccepted',
            'e.attendees',
            'attendee',
            (qb) => qb
                .where('attendee.answer = :answer', {answer:AttendeeAnswerEnum.Accepted})
        )
        .loadRelationCountAndMap(
            'e.attendeeMaybe', 'e.attendees',
            'attendee',
            (qb) => qb
                .where('attendee.answer = :answer', {answer:AttendeeAnswerEnum.Maybe})
        )
        .loadRelationCountAndMap(
            'e.attendeeRejected', 'e.attendees',
            'attendee',
            (qb) => qb
                .where('attendee.answer = :answer', {answer:AttendeeAnswerEnum.Rejected})
        );
    }

    private async getEventWithAttendeeCountFiltered(filter?: ListEvents) {
        let query = this.getEventsWithAttendeeCountQuery();

        if(!filter) {
            return query;
        }

        if(filter.when) {
            if(filter.when == WhenEventFilter.Today) {
                query = query.andWhere(
                    'e.when >= CURDATE() and e.when <= CURDATE() + INTERVAL 1 DAY'
                )
            }
            if(filter.when == WhenEventFilter.Tomorrow) {
                query = query.andWhere(
                    'e.when >= CURDATE() + INTERVAL 1 DAY and e.when <= CURDATE() + INTERVAL 2 DAY'
                )
            }
            if(filter.when == WhenEventFilter.ThisWeek) {
                query = query.andWhere(
                    'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1)'
                )
            }
            if(filter.when == WhenEventFilter.ThisWeek) {
                query = query.andWhere(
                    'YEARWEEK(e.when, 1) = YEARWEEK(CURDATE(), 1) + 1'
                )
            }
        }

        return await query;
    }
    
    public async getEventsWithAttendeeCountFilteredPaginated(
        filter: ListEvents,
        paginateOptions: PaginateOptions
    ) {
        return await paginate(
            await this.getEventWithAttendeeCountFiltered(filter),
            paginateOptions
        )
    }

    public async getEvent(id: number): Promise<Event | undefined> {
        const query = this.getEventsWithAttendeeCountQuery()
            .andWhere('e.id = :id', { id });
        this.logger.debug(query.getSql());
        return await query.getOne();
    }

    public async createEvent(input: CreateEventDto, user: User): Promise<Event> {
        return await this.eventsRepository.save({
            ...input,
            organizer: user,
            when: new Date(input.when),
        })
    }

    public async updateEvent(event: Event, input: UpdateEventDto): Promise<Event> {
        return await this.eventsRepository.save({
            ...event,
            ...input,
            when: input.when ? new Date(input.when) : event.when
        });
    }

    public async deleteEvent(id: number): Promise<DeleteResult> {
        return await this.eventsRepository
            .createQueryBuilder('e')
            .delete()
            .where('id = :id', { id })
            .execute()
    }
}