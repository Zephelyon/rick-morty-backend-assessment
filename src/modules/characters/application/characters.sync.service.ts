import { Injectable, Inject, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Sequelize } from 'sequelize-typescript';
import { SEQUELIZE } from '../../../database/sequelize/sequelize.provider';
import { Character } from '../../../database/sequelize/models/characters.model';
import { Origin } from '../../../database/sequelize/models/origin.model';
import { request, gql } from 'graphql-request';
import { RedisService } from '../../../infrastructure/cache/redis/redis.service';

interface ApiCharacter {
  id: number;
  name: string;
  status: string | null;
  species: string | null;
  gender: string | null;
  origin: string | null;
}

@Injectable()
export class CharactersSyncService {
  private readonly logger = new Logger(CharactersSyncService.name);

  constructor(
    @Inject(SEQUELIZE) private readonly sequelize: Sequelize,
    private readonly redis: RedisService,
  ) {}

  @Cron(CronExpression.EVERY_12_HOURS)
  async syncCharacters(): Promise<void> {
    try {
      const repo = this.sequelize.getRepository(Character);
      const total = await repo.count();
      if (total === 0) {
        this.logger.log('No characters in DB to sync. Skipping.');
        return;
      }

      // Limit to first page size of public API (20) to match initial seed behavior (15 inserted)
      const limit = Math.min(total, 20);
      const latest = await this.fetchCharacters(limit);

      let updated = 0;
      for (const c of latest) {
        const row = await repo.findOne({ where: { id: c.id } });
        if (!row) continue; // Only update existing rows; we do not insert new ones here

        const changes: Partial<Character> = {};
        if ((row.status ?? null) !== (c.status ?? null))
          changes.status = c.status as any;
        if ((row.species ?? null) !== (c.species ?? null))
          changes.species = c.species as any;
        if ((row.gender ?? null) !== (c.gender ?? null))
          changes.gender = c.gender as any;

        // Dual-write origin string and originId (normalized)
        let desiredOriginId: number | null = null;
        if (c.origin) {
          const originRepo = this.sequelize.getRepository(Origin);
          const [o] = await originRepo.findOrCreate({
            where: { name: c.origin },
            defaults: { name: c.origin },
          });
          desiredOriginId = (o as any).id as number;
        }

        if ((row.origin ?? null) !== (c.origin ?? null))
          (changes as any).origin = c.origin as any;
        if ((row as any).originId !== desiredOriginId)
          (changes as any).originId = desiredOriginId as any;

        if (Object.keys(changes).length > 0) {
          await row.update(changes);
          updated++;
        }
      }

      this.logger.log(
        `Character sync completed. Updated ${updated} record(s).`,
      );

      // Invalidate cache only if data changed
      if (updated > 0) {
        try {
          const deleted = await this.redis.delByPrefix('characters:');
          this.logger.log(
            `Cache invalidated for prefix 'characters:'. Deleted ${deleted} key(s).`,
          );
        } catch (e) {
          this.logger.warn(`Failed to invalidate cache: ${e}`);
        }
      }
    } catch (err) {
      this.logger.error('Character sync failed', err);
    }
  }

  private async fetchCharacters(limit = 15): Promise<ApiCharacter[]> {
    const endpoint = 'https://rickandmortyapi.com/graphql';
    const query = gql`
      query {
        characters(page: 1) {
          results {
            id
            name
            status
            species
            gender
            origin {
              name
            }
          }
        }
      }
    `;
    const data = await request<any>(endpoint, query);
    const results = data?.characters?.results || [];
    return results.slice(0, limit).map((c: any) => ({
      id: c.id,
      name: c.name,
      status: c.status ?? null,
      species: c.species ?? null,
      gender: c.gender ?? null,
      origin: c.origin?.name ?? null,
    }));
  }
}
