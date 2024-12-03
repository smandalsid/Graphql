import { Controller, Get, Post, Patch, Delete, Param, Body, HttpCode, ParseIntPipe, ValidationPipe, Logger, NotFoundException } from "@nestjs/common";
import { CreateEventDto } from "./create-event.dto";
import { UpdateEventDto } from "./udpate-event.dto";
import { Event } from "./event.entity";
import { Like, MoreThan, Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

@Controller('/events')
export class EventsController {
  private readonly logger = new Logger(EventsController.name);


  constructor(
    @InjectRepository(Event)
    private readonly repository: Repository<Event>
  ) { }

  @Get()
  async findAll() {
    this.logger.log('Hit the findall route');
    const events = await this.repository.find();
    this.logger.debug(`Found ${events.length} events`);
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
    return await this.repository.findOne({
      where: {
        id: 1
      },
      relations: ['attendees']
    });
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const event = await this.repository.findOne({
      where: {
        id: id
      },
    });

    if (!event) {
      throw new NotFoundException();
    }
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
    const event = await this.repository.findOne(id);
    if (!event) {
      throw new NotFoundException();
    }
    await this.repository.remove(event);
  }

}