import { AbstractRepository } from '@app/common';
import { Room } from '@app/common/entities';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

@Injectable()
export class RoomsRepository extends AbstractRepository<Room> {
  protected readonly logger = new Logger(RoomsRepository.name);

  constructor(
    @InjectRepository(Room)
    roomsRepository: Repository<Room>,
    entityManager: EntityManager,
  ) {
    super(roomsRepository, entityManager);
  }
}
