import { UserRole } from '@app/common';
import { Roles } from '@app/common/decorators';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FindUsersDto } from './dto/find-users.dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(+id);
  }

  @UseGuards(JwtAuthGuard)
  @MessagePattern('all_users')
  async findAllUsers(@Payload() payload: FindUsersDto) {
    return this.usersService.findAll(payload);
  }
}
