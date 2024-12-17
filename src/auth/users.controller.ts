import { BadRequestException, Body, Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { AuthService } from "./auth.service";
import { CreateUserDto } from "./input/create.user.dto";
import { User } from "./user.entity";
import { UserService } from "./user.service";

@Controller('users')
export class UsersController {
  constructor(
    private readonly authService: AuthService,
    @InjectRepository(User)
    private readonly userService: UserService
  ) { }

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    if (createUserDto.password !== createUserDto.retypedPassword) {
      throw new BadRequestException(['Passwords are not identical']);
    }

    const user = await this.userService.create(createUserDto);

    return {
      ...user,
      token: this.authService.getTokenForUser(user),
    };
  }
}