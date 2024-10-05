import { CurrentUser, JwtAuthGuard } from '@app/common';
import { User } from '@app/common/entities';
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateRoomDto) {
    console.log(user)
    return this.roomsService.createRoom(user, body);
  }
  @Get()
  async findAll(@CurrentUser() user: User, @Query('keywords') keywords: string,  @Query('limit') limit: number = 20, @Query('offset') offset: number = 0) {
    const [data, totalRecords] = await this.roomsService.findAll(keywords, limit, offset);
    return {
      data, 
      totalRecords,
    }
  }
  
  @Get('search/:keywords')
  search(@Param('keywords') keywords: string) {
    return this.roomsService.searchRooms(keywords);
  }

  @Get(':id')
  findOneById(@Param('id') id: number) {
    return this.roomsService.getRoom(id);
  }

  @Put('join/:id')
  joinRoom(@CurrentUser() user, @Param('id') id: number) {
    return this.roomsService.joinRoom(user, id);
  }

  @Put('leave/:id')
  leaveRoom(@CurrentUser() user, @Param('id') id: number) {
    return this.roomsService.joinRoom(user, id);
  }

}
