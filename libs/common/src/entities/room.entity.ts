import { AbstractEntity } from '@app/common/database/abstract.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Room extends AbstractEntity<Room> {
    @Column({ length: 50, unique: true })
    name: string;

    @Column('text', { nullable: true })
    description: string;

    @Column('integer', { array: true })
    userIds: number[];

    @Column('integer')
    hostId: number;

    @Column()
    hostName: string;

    @Column()
    uuid: string;
}
