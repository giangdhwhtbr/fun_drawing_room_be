import { User, Room } from "./libs/common/src/entities"

// const database = 'auth_service'
const database = 'rooms_service'

const databaseConfiguration = {
  auth_service: {
    entities: [User],
    seeds: ['seeding/seeds/auth_service/*{.ts,.js}'],
    factories: ['seeding/factories/auth_service/*{.ts,.js}'],
  },
  rooms_service: {
    entities: [Room],
    seeds: ['seeding/seeds/rooms_service/*{.ts,.js}'],
    factories: ['seeding/factories/rooms_service/*{.ts,.js}'],
  },
}

const configuration = {
  type: 'postgres',
  entities: databaseConfiguration[database].entities,
  seeds: databaseConfiguration[database].seeds,
  factories: databaseConfiguration[database].factories,
  host: 'localhost',
  port: '5434',
  username: 'admin',
  password: 'admin',
  database: database,
}

module.exports = configuration
