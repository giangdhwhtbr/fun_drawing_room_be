import { Room } from '../../../libs/common/src/entities'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'

export default class CreateRooms implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await factory(Room)().createMany(100)
  }
}
