import { CurrentUser, JwtAuthGuard } from '@app/common';
import { User } from '@app/common/entities';
import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomsService } from './rooms.service';

@UseGuards(JwtAuthGuard)
@Controller('rooms')
export class RoomsController {
  private readonly logger = new Logger(RoomsController.name);

  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() body: CreateRoomDto) {
    return this.roomsService.createRoom(user, body);
  }
  @Get()
  findAll(@CurrentUser() user: User, @Query('limit') limit: number = 20, @Query('offset') offset: number = 0) {
    return this.roomsService.findAll(limit, offset);
  }
  
  @Get(':keywords')
  search(@Param('keywords') keywords: string) {
    return this.roomsService.searchRooms(keywords);
  }

  @Get(':id')
  findOneById(@Param('id') id: string) {
    return this.roomsService.getRoom(id);
  }

  @Patch(':id')
  update(@CurrentUser() user, @Param('id') id: string) {
    return this.roomsService.updateRoom(user, id);
  }

  @Delete(':id')
  deleteRoom() {
    return this.roomsService.deleteRoom();
  }
}
