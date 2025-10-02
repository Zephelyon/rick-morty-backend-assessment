import { Module } from '@nestjs/common';
import { CharactersService } from '../application/characters.service';
import { CharactersResolver } from './graphql/characters.resolver';
import { CharactersRepository } from '../infrastructure/persistence/sequelize/characters.repository';
import { DatabaseModule } from '../../../database/database.module';
import { RedisModule } from '../../../infrastructure/cache/redis/redis.module';
import { CharactersSyncService } from '../application/characters.sync.service';

@Module({
  imports: [DatabaseModule, RedisModule],
  providers: [CharactersService, CharactersResolver, CharactersRepository, CharactersSyncService],
  exports: [CharactersService, CharactersRepository],
})
export class CharactersModule {}
