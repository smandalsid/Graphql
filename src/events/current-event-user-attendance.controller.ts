import { Body, ClassSerializerInterceptor, Controller, DefaultValuePipe, Get, NotFoundException, Param, ParseIntPipe, Put, Query, SerializeOptions, UseGuards, UseInterceptors } from "@nestjs/common";
import { EventsService } from "./events.service";
import { AttendeesService } from "./attendees.servics";
import { CreateAttendeeDto } from "./input/create-attendee.dto";
import { CurrentUser } from "./../auth/current-user.decorator";
import { User } from "./../auth/user.entity";
import { AuthGaurdJwt } from "./../auth/auth-gaurd.jwt"; 

@Controller('events-attendance')
@SerializeOptions({strategy: 'excludeAll'})
export class CurrentUserEventAttendanceController {
    constructor(
        private readonly eventsService: EventsService,
        private readonly attendeeService: AttendeesService
    ) {}

    @Get()
    async findAll(
        @CurrentUser() user: User,
        @Query('page', new DefaultValuePipe(1),ParseIntPipe) page = 1
    ) {
        return await this.eventsService.getEventsAttendedByUserIdPaginated(
            user.id,
            {limit: 6, currentpage: page}
        )
    }

    @Get(':eventId')
    @UseGuards(AuthGaurdJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async findOne(
        @Param('eventId', ParseIntPipe) eventId: number,
        @CurrentUser() user: User
    ) {
        const attendee = await this.attendeeService.findOneByEventIdAndUserId(
            eventId,
            user.id
        )

        if(!attendee) {
            throw new NotFoundException();
        }

        return attendee;
    }

    @Put(':eventId')
    @UseGuards(AuthGaurdJwt)
    @UseInterceptors(ClassSerializerInterceptor)
    async createOrUpdate(   
        @Param('eventId', ParseIntPipe) eventId: number,
        @Body() input: CreateAttendeeDto,
        @CurrentUser() user: User,
    ){
        return this.attendeeService.createOrUpdate(
            input, eventId, user.id
        )
    }

}