import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventsController } from './events.controller';
import { Attendee } from './attendee.entity';
import { EventsService } from './events.service';
import { AttendeesService } from './attendees.servics';
import { CurrentUserEventAttendanceController } from './current-event-user-attendance.controller';
import { eventAttendeesController } from './event-attendees.controller';
import { EventsOrganizedByUserController } from './events-organized-by-user.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Event, Attendee]),
    ],
    controllers: [
        EventsController,
        CurrentUserEventAttendanceController,
        eventAttendeesController,
        EventsOrganizedByUserController
    ],
    providers: [EventsService, AttendeesService],
})
export class EventsModule {}
