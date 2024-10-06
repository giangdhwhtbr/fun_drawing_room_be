import { Logger } from '@nestjs/common'
import Redis from 'ioredis'

export const cacheProviders = [
  {
    provide: 'REDIS',
    useFactory: () => {
      const REDIS_URL = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`
      Logger.log(`Connect to redis ${REDIS_URL}`)
      return new Redis(REDIS_URL, {
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
      })
    },
  },
]
