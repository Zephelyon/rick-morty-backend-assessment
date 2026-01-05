import { Injectable } from '@nestjs/common';
import { CharactersRepository } from '../infrastructure/persistence/sequelize/characters.repository';
import type { CharacterFilterInput } from '../interfaces/graphql/dto/character-filter.input';
import { RedisService } from '../../../infrastructure/cache/redis/redis.service';

function stableStringify(obj: any): string {
  if (!obj || typeof obj !== 'object') return JSON.stringify(obj);
  const allKeys = Object.keys(obj).sort();
  const sorted: Record<string, unknown> = {};
  for (const k of allKeys) sorted[k] = obj[k];
  return JSON.stringify(sorted);
}

@Injectable()
export class CharactersService {
  constructor(
    private readonly repo: CharactersRepository,
    private readonly redis: RedisService,
  ) {}

  /**
   * Searches for characters based on a filter and caches the result.
   *
   * Cache strategy:
   * - Key: `characters:${stableStringify(filter)}` ensures stable field ordering.
   * - TTL: 120s. Consider invalidating on writes with RedisService.delByPrefix('characters:').
   *
   * Parameters:
   * - filter: Optional fields for filtering and pagination (limit/offset must be validated upstream).
   *
   * Returns: A flat list of characters (plain objects), never Sequelize instances.
   */
  async search(filter: CharacterFilterInput = {}) {
    const key = `characters:${stableStringify(filter)}`;
    const cached = await this.redis.get<any[]>(key);
    if (cached) return cached;

    const rows = await this.repo.findByFilter(filter);
    const plain = rows.map((r: any) => (r.get ? r.get({ plain: true }) : r));
    await this.redis.set(key, plain, 120);
    return plain;
  }

  async getById(id: number) {
    const row = await this.repo.findById(id);
    return row ? (row as any).get?.({ plain: true }) ?? row : null;
  }

  async create(input: any) {
    const created = await this.repo.create(input);
    try {
      await this.redis.delByPrefix('characters:');
    } catch {}
    return (created as any).get?.({ plain: true }) ?? created;
  }

  async update(id: number, input: any) {
    const updated = await this.repo.updateById(id, input);
    if (updated) {
      try {
        await this.redis.delByPrefix('characters:');
      } catch {}
      return (updated as any).get?.({ plain: true }) ?? updated;
    }
    return null;
  }

  async remove(id: number) {
    const ok = await this.repo.deleteById(id);
    if (ok) {
      try {
        await this.redis.delByPrefix('characters:');
      } catch {}
    }
    return ok;
  }
}
