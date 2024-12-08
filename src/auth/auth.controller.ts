import { Controller, Get, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { User } from "./user.entity";
import { AuthGaurdLocal } from "./auth-gaurd.local";
import { AuthGaurdJwt } from "./auth-gaurd.jwt";

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ) { }

  @Post('login')
  @UseGuards(AuthGaurdLocal)
  async login(@CurrentUser() user: User) {
    return {
      userId: user.id,
      token: this.authService.getTokenForUser(user)
    }
  }

  @Get('profile')
  @UseGuards(AuthGaurdJwt)
  async getProfile(@CurrentUser() user: User) {
    return user;
  }
}