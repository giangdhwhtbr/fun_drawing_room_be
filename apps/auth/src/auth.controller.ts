import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { CurrentUser } from '@app/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { User } from '../../../libs/common/src/entities';
import { UsersService } from './users/users.service';
import { CreateUserDto, ForgotPasswordDto, ResetPasswordDto } from './users/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ) {
    const jwt = await this.authService.login(user, response);
    response.send(jwt);
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    await this.usersService.create(createUserDto);
    return { success: true, message: 'Registration successfully!' };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() data: ForgotPasswordDto) {
    await this.usersService.requestPasswordReset(data.email);
    return { success: true, message: 'A password recovery email has been sent to you!' };
  }

  @Post('reset-password')
  async resetPassword(@Body() data: ResetPasswordDto) {
    await this.usersService.resetPassword(data);
    return { success: true, message: 'Password reset successfully!' };
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('authenticate')
  async authenticate(@Payload() data: any) {
    return data.user;
  }
}
