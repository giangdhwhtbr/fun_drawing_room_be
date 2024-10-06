import { UserRole } from '@app/common';
import { Roles } from '@app/common/decorators';
import { Body, Controller, Get, Logger, Param, Post, UseGuards } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  constructor(private readonly usersService: UsersService) { }

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

  @MessagePattern('all_users')
  async findAllUsers(@Payload() payload: any) {
    // Log the received payload to debug
    this.logger.log('Received payload for all_users:', payload);

    const { Authorization, ids } = payload;

    if (!Authorization || !ids) {
      throw new Error('Invalid payload: missing Authorization or ids');
    }

    // Process the ids (which should be an array) and fetch users
    const users = await this.usersService.findAll({ ids });

    return users.map((user) => user.toJson());
  }
}
