import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, ParseIntPipe, ValidationPipe, Logger, NotFoundException, Query, UsePipes } from "@nestjs/common";
import { CreateEventDto } from "./input/create-event.dto";
import { UpdateEventDto } from "./input/udpate-event.dto";
import { Event } from "./event.entity";
import { Like, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Attendee } from "./attendee.entity";
import { EventsService } from "./events.service";
import { ListEvents } from "./input/list.events";

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);


  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>,
    @InjectRepository(Attendee)
    private readonly attendeerepository: Repository<Attendee>,
    private readonly eventsService: EventsService
  ) { }

  @Get()
  @UsePipes(new ValidationPipe({transform: true}))
  async findAll(@Query() filter: ListEvents) {
    const events = await this.eventsService.getEventsWithAttendeeCountFilteredPaginated(
      filter,
      {
        total: true,
        currentpage: filter.page,
        limit: 2

      }
    );
    return events;
  }
  
  @Get('/practice')
  async practice() {
    return await this.repository.find({
      select: ['id', 'when'],
      where: [{
        id: MoreThan(3),
        when: MoreThan(new Date('2021-02-12T13:00:00'))
      }, {
        description: Like('%meet%')
      }],
      take: 2,
      order: {
        id: 'DESC'
      }
    });
  }
  
  @Get('/practice2')
  async practice2() {
    // return await this.repository.findOne({
    //   where: {
    //     id: 1
    //   },
    //   relations: ['attendees']
    // });

    const event = await this.repository.findOne({
      where: {
        id: 1,
      },
      relations: ['attendees']
    });
    const attendee = new Attendee();
    attendee.name = 'Using cascade';
    // attendee.event = event;

    event.attendees.push(attendee);

    // await this.attendeerepository.save(attendee)
    await this.repository.save(event);
    return event;
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.eventsService.getEvent(id);
    if (!event) {
      throw new NotFoundException();
    }
    return event;
  }

  @Post()
  async create(@Body() input: CreateEventDto) {
    return await this.repository.save({
      ...input,
      when: new Date(input.when)
    });
  }

  @Patch(':id')
  async update(@Param('id') id, @Body() input: UpdateEventDto) {
    const event = await this.repository.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }
    return await this.repository.save({
      ...event,
      ...input,
      when: input.when ? new Date(input.when) : event.when
    });
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id) {
    const result = await this.eventsService.deleteEvent(id)

    if(result?.affected !==1) {
      throw new NotFoundException();
    }
    
  }

}