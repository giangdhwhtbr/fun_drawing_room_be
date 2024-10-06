import { faker } from '@faker-js/faker'
import * as uuid from 'uuid'
import { define } from 'typeorm-seeding'
import { Room } from '../../../libs/common/src/entities'

define(Room, () => {
  const room = new Room({
    uuid: uuid.v4(),
    hostId: 1,
    hostName: 'Admin',
    userIds: [1],
    name: faker.company.name() + ' ' + faker.string.alpha(10),
    description: faker.lorem.sentence(),
  })
  return room
})
