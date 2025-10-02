import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client!: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    this.client = createClient({
      socket: {
        host: this.configService.get<string>('REDIS_HOST'),
        port: (() => {
          const v = this.configService.get<string>('REDIS_PORT');
          return v ? Number(v) : undefined;
        })(),
      },
    });
    this.client.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Redis Client Error', err);
    });
    await this.client.connect();
  }


  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const raw = await this.client.get(key);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as unknown as T;
    }
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds = 600): Promise<void> {
    const payload = typeof value === 'string' ? (value as string) : JSON.stringify(value);
    await this.client.set(key, payload, { EX: ttlSeconds });
  }

  // Delete all keys that start with a given prefix. Useful for invalidate-on-write.
  async delByPrefix(prefix: string): Promise<number> {
    if (!prefix) return 0;
    let deleted = 0;
    // node-redis v5 scan iterator
    const iterator = (this.client as any).scanIterator({ MATCH: `${prefix}*` });
    for await (const key of iterator as AsyncIterable<string>) {
      const n = await this.client.del(key as string);
      deleted += n ?? 0;
    }
    return deleted;
  }
}
