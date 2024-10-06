import { Module } from '@nestjs/common'
import { cacheProviders } from './cache.providers'
import { CacheService } from './cache.service'

@Module({
  providers: [...cacheProviders, CacheService],
  exports: ['REDIS', CacheService],
})
export class CacheModule {}
