import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, ParseIntPipe, ValidationPipe, NotFoundException, Query, UsePipes, UseGuards, ForbiddenException, SerializeOptions, UseInterceptors, ClassSerializerInterceptor } from "@nestjs/common";
import { CreateEventDto } from "./input/create-event.dto";
import { UpdateEventDto } from "./input/udpate-event.dto";
import { EventsService } from "./events.service";
import { ListEvents } from "./input/list.events";
import { CurrentUser } from "src/auth/current-user.decorator";
import { User } from "src/auth/user.entity";
import { AuthGaurdJwt } from "src/auth/auth-gaurd.jwt";

@Controller('/events')
@SerializeOptions({strategy: 'excludeAll'})
export class EventsController {

  constructor(
    private readonly eventsService: EventsService
  ) { }

  @Get()
  @UsePipes(new ValidationPipe({transform: true}))
  @UseInterceptors(ClassSerializerInterceptor)
  async findAll(@Query() filter: ListEvents) {
    const events = await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
      filter,
      {
        total: true,
        currentpage: filter.page,
        limit: 5

      }
    );
    return events;
  }
  
  // @Get('/practice')
  // async practice() {
  //   return await this.repository.find({
  //     select: ['id', 'when'],
  //     where: [{
  //       id: MoreThan(3),
  //       when: MoreThan(new Date('2021-02-12T13:00:00'))
  //     }, {
  //       description: Like('%meet%')
  //     }],
  //     take: 2,
  //     order: {
  //       id: 'DESC'
  //     }
  //   });
  // }
  
  // @Get('/practice2')
  // async practice2() {
    // return await this.repository.findOne({
    //   where: {
    //     id: 1
    //   },
    //   relations: ['attendees']
    // });

  //   const event = await this.repository.findOne({
  //     where: {
  //       id: 1,
  //     },
  //     relations: ['attendees']
  //   });
  //   const attendee = new Attendee();
  //   attendee.name = 'Using cascade';
  //   // attendee.event = event;

  //   event.attendees.push(attendee);

  //   // await this.attendeerepository.save(attendee)
  //   await this.repository.save(event);
  //   return event;
  // }

  @Get(':id')
  @UseInterceptors(ClassSerializerInterceptor)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEventWithAttendeeCount(id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
  @UseGuards(AuthGaurdJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async create(
    @Body() input: CreateEventDto,
    @CurrentUser() user: User
  ) {
    return await this.eventsService.createEvent(
      input,
      user
    );
  }

  @Patch(':id')
  @UseGuards(AuthGaurdJwt)
  @UseInterceptors(ClassSerializerInterceptor)
  async update(
    @Param('id', ParseIntPipe) id,
    @Body() input: UpdateEventDto,
    @CurrentUser() user: User
  ) {
    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }

    if(event.organizerID !== user.id) {
      throw new ForbiddenException(
        null, "You are not authorized to modify this event!"
      );
    }
    return await this.eventsService.updateEvent(event, input);
  }

  @Delete(':id')
  @UseGuards(AuthGaurdJwt)
  @HttpCode(204)
  async remove(
    @Param('id', ParseIntPipe) id,
    @CurrentUser() user: User,
  ) {

    const event = await this.eventsService.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }

    if(event.organizerID !== user.id) {
      throw new ForbiddenException(
        null, "You are not authorized to delete this event!"
      );
    }

    await this.eventsService.deleteEvent(id);
    
  }

}