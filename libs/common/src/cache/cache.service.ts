import { Inject, Injectable } from '@nestjs/common'
import { Redis } from 'ioredis'
import { User } from '../entities'


@Injectable()
export class CacheService {
  constructor(@Inject('REDIS') private redis: Redis) {}
  async getCache(key: string) {
    const cached = await this.redis.get(key)
    if (!cached) {
      return null
    }
    return JSON.parse(cached)
  }

  async setCache(key, data, expiration?) {
    if (expiration) {
      return await this.redis.set(
        key,
        JSON.stringify(data),
        'EX',
        expiration || 7200,
      )
    } else {
      return await this.redis.set(
        key,
        JSON.stringify(data),
      )
    }
  }

  async setSession(key: string, session: User, expiration = 60 * 60 * 24) {
    return this.setCache(`user-session-${key}`, session, expiration)
  }

  async getSession(key: string): Promise<User> {
    return this.getCache(`user-session-${key}`)
  }

  async clearSession(key: string) {
    return `user-session-${key}`
  }

  async deleteCache(key: string) {
    await this.redis.del(key)
  }

  async deletePattern(pattern: string) {
    const keys = await this.redis.keys(pattern);
    if (keys.length) {
      await this.redis.del(keys)
    }
  }
}
