import { faker } from '@faker-js/faker'
import { define } from 'typeorm-seeding'

import { User } from '../../../libs/common/src/entities'
import { UserRole } from '../../../libs/common/src/constant'

define(User, () => {
  const user = new User({
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: UserRole.USER,
    isActivated: true,
  })
  user.setPassword("password")
  return user
})
