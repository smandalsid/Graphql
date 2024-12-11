import { Repository } from "typeorm";
import { EventsController } from "./events.controller";
import { EventsService } from "./events.service";
import { Event } from "./event.entity";
import { ListEvents } from "./input/list.events";
import { User } from "./../auth/user.entity";
import { NotFoundException } from "@nestjs/common";

describe('EventsController', ()=>{

    let eventsController: EventsController;
    let eventsService: EventsService;
    let eventRepository: Repository<Event>;

    beforeAll(() => console.log("This logged once"));
    beforeEach(() => {
        eventsService = new EventsService(eventRepository);
        eventsController = new EventsController(eventsService);
    })

    it('should return a list of events', async()=>{
        const result = {
            first: 1,
            last: 1,
            limit: 10,
            data: []
        };

        eventsService.getEventsWithAttendeeCountFilteredPaginated = 
        jest.fn().mockImplementation((): any => result);

        const spy = jest
            .spyOn(eventsService, 'getEventsWithAttendeeCountFilteredPaginated')
            .mockImplementation((): any => result);

        expect(await eventsController.findAll(new ListEvents)).toEqual(result);
        expect(spy).toHaveBeenCalledTimes(1);  
    })

    it('it should not delete an event when its not found', async()=>{
        const deleteSpy = jest.spyOn(eventsService, 'deleteEvent');
        const findSpy = jest.spyOn(eventsService, 'findOne')
            .mockImplementation((): any => undefined);

        try{
            await eventsController.remove(1, new User());
        } catch(error) {
            expect(error).toBeInstanceOf(NotFoundException);
        }

        expect(deleteSpy).toHaveBeenCalledTimes(0);
        expect(findSpy).toHaveBeenCalledTimes(1);
    })
 })