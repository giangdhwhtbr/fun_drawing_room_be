import { User } from '../../../libs/common/src/entities'
import { Connection } from 'typeorm'
import { Factory, Seeder } from 'typeorm-seeding'


export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    await factory(User)().createMany(100)
  }
}
