import { AUTH_SERVICE } from '@app/common';
import { Room, User } from '@app/common/entities';
import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import * as uuid from 'uuid';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class RoomsService {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    @InjectRepository(Room)
    private readonly repository: Repository<Room>,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) { }

  async createRoom(user: User, payload: CreateRoomDto) {

    const existingRoom = await this.repository.findOne({
      where: {
        name: payload.name,
      },
    });

    if (existingRoom) {
      throw new BadRequestException('Room already exists');
    }

    const room = new Room({
      ...payload,
      uuid: uuid.v4(),
      hostId: user.id,
      hostName: user.name,
      userIds: [user.id],
    });

    await this.repository.save(room);

    return room;
  }

  searchRooms(keywords: string) {
    return this.repository.find({
      where: keywords ? {
        name: ILike(`%${keywords}%`),
      } : {},
      take: 20,
    });
  }

  findAll(keywords: string, limit: number, offset: number) {
    return this.repository.findAndCount({
      where: keywords ? { name: ILike(`%${keywords}%`) } : {},
      take: limit,
      skip: offset,
    });
  }

  getRoom(id: number) {
    return this.repository.findOneBy({ id });
  }

  async getRoomParticipants(id: number) {
    const room = await this.repository.findOneBy({ id });
    return this.authClient
      .send('findAllUsers', {
        ids: room.userIds,
      })
      .pipe();
  }

  async joinRoom(user: User, id: number) {
    const room = await this.repository.findOneBy({ id });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (room.userIds.includes(user.id)) {
      throw new BadRequestException('User already in room');
    }
    if (room.userIds.length === 30) {
      throw new BadRequestException('Room is full');
    }
    room.userIds.push(user.id);
    await this.repository.save(room);
  }

  async leaveRoom(user: User, id: number) {
    const room = await this.repository.findOneBy({ id });
    if (!room) {
      throw new NotFoundException('Room not found');
    }
    if (!room.userIds.includes(user.id)) {
      throw new BadRequestException('User not in room');
    }
    room.userIds = room.userIds.filter((userId) => userId !== user.id);
    await this.repository.save(room);
  }

}
