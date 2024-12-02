import { Length } from "class-validator";

export class CreateEventDto {
    @Length(5, 255, {message: "The name length is invalid"})
    name: string;
    description: string;
    when: string;
    address: string;
}