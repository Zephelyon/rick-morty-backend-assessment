import { Resolver, Query, Args } from '@nestjs/graphql';
import { CharactersService } from '../../application/characters.service';
import { CharacterType } from './dto/character.type';
import { CharacterFilterInput } from './dto/character-filter.input';
import { LogExecutionTime } from '../../../../common/decorators/log-execution-time.decorator';

@Resolver(() => CharacterType)
export class CharactersResolver {
  constructor(private readonly service: CharactersService) {}


  // New explicit alias to fit the requested documentation structure
  @Query(() => [CharacterType], { name: 'getCharactersRickAndMorty' })
  @LogExecutionTime('GraphQL Query: getCharactersRickAndMorty')
  /**
   * GraphQL Query: Retrieves Rick and Morty characters by applying optional filters.
   * Delegate to CharactersService.search for logic and caching.
   *
   * Args:
   * - filter: Optional criteria (can be omitted).
   *
   * Returns: List of CharacterTypes (empty array if no results).
   */
  async getCharactersRickAndMorty(
    @Args('filter', { type: () => CharacterFilterInput, nullable: true }) filter?: CharacterFilterInput,
  ): Promise<CharacterType[]> {
    const res = await this.service.search(filter ?? {});
    return Array.isArray(res) ? res : [];
  }
}
