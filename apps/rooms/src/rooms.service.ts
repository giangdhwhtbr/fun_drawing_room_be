import { Injectable, Logger } from '@nestjs/common';
import { RoomsRepository } from './rooms.repository';
import * as uuid from 'uuid'
import { CreateRoomDto } from './dto/create-room.dto';
import { Room, User } from '@app/common/entities';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    private readonly repository: RoomsRepository,
  ) {}

  async createRoom(user: User ,payload: CreateRoomDto) {
    const room = new Room({
      ...payload,
      uuid: uuid.v4(),
      hostId: user.id,
      hostName: user.name,
      userIds: [user.id],
    });

    await this.repository.create(room);

    return room;
  }

  searchRooms(keywords: string) {
    return `This action returns all rooms matching the keywords: ${keywords}`;
  }

  findAll(limit: number, offset: number) {
    return `This action returns all rooms with limit: ${limit} and offset: ${offset}`;
  }

  getRoom(id: string) {
    return `This action returns a room with id: ${id}`;
  }

  updateRoom(user: any, id: string) {
    return `This action updates a room with id: ${id}`;
  }

  deleteRoom() {
    return 'This action removes a room';
  }
}
