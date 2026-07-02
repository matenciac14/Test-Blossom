import { ICachePort } from '../../domain/ports/cache.port'
import { redisClient } from './redis.client'

export class RedisCache implements ICachePort {
  async get<T>(key: string): Promise<T | null> {
    const value = await redisClient.get(key)
    if (!value) return null
    return JSON.parse(value) as T
  }

  async set<T>(key: string, value: T, ttlSeconds = 300): Promise<void> {
    await redisClient.set(key, JSON.stringify(value), 'EX', ttlSeconds)
  }

  async del(key: string): Promise<void> {
    await redisClient.del(key)
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redisClient.keys(pattern)
    if (keys.length > 0) {
      await redisClient.del(...keys)
      console.log(`[Cache] Invalidated ${keys.length} keys matching "${pattern}"`)
    }
  }
}
