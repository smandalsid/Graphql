import { Event } from "./event.entity"

test('Event should be initialized through constructor', ()=>{
    const event = new Event({
        name: 'Interesting Event',
        description: 'That was fun'
    });

    expect(event).toEqual({
        name: 'Interesting Event',
        description: 'That was fun'
    })
})