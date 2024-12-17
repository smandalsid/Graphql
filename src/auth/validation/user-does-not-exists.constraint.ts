import { InjectRepository } from "@nestjs/typeorm";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Repository } from "typeorm";
import { User } from "../user.entity";
import { Injectable } from "@nestjs/common";

@Injectable()
@ValidatorConstraint({async: true})
export class UserDoesNotExistConstraint implements ValidatorConstraintInterface{
    constructor(
        @InjectRepository(User)
        private readonly userRespository: Repository<User>
    ) {}
    
    async validate(value: any, validationArguments?: ValidationArguments): Promise<boolean> {
        const entity = await this.userRespository.findOneBy({
            [validationArguments.property]: value,
        });

        return entity===null;
    }
    defaultMessage?(validationArguments?: ValidationArguments): string {
        return `${validationArguments.property} already taken`;
    }
}

export function UserDoesNotExist(validationOptions?: ValidationOptions) {
    return function(object: any, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: UserDoesNotExistConstraint,
        })
    }
}