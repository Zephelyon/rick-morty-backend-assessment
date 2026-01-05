import { Resolver, Query, Args, Mutation, Int } from '@nestjs/graphql';
import { CharactersService } from '../../application/characters.service';
import { CharacterType } from './dto/character.type';
import { CharacterFilterInput } from './dto/character-filter.input';
import { LogExecutionTime } from '../../../../common/decorators/log-execution-time.decorator';
import { InputType, Field } from '@nestjs/graphql';
import {
  IsOptional,
  IsString,
  MaxLength,
  Transform,
} from '../../../../common/validation/optional-validators';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

@InputType()
class CharacterCreateInput {
  @Field({ description: 'Character name' })
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  name!: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(trim)
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  species?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(trim)
  gender?: string;

  @Field({ nullable: true, description: 'Origin name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  origin?: string;
}

@InputType()
class CharacterUpdateInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(trim)
  status?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  species?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  @Transform(trim)
  gender?: string;

  @Field(() => String, { nullable: true, description: 'Origin name (set null to clear)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  origin?: string | null;
}

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
    @Args('filter', { type: () => CharacterFilterInput, nullable: true })
    filter?: CharacterFilterInput,
  ): Promise<CharacterType[]> {
    const res = await this.service.search(filter ?? {});
    return Array.isArray(res) ? res : [];
  }

  @Query(() => CharacterType, { name: 'getCharacterById', nullable: true })
  @LogExecutionTime('GraphQL Query: getCharacterById')
  async getCharacterById(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<CharacterType | null> {
    return this.service.getById(id);
  }

  @Mutation(() => CharacterType, { name: 'createCharacter' })
  @LogExecutionTime('GraphQL Mutation: createCharacter')
  async createCharacter(
    @Args('input', { type: () => CharacterCreateInput }) input: CharacterCreateInput,
  ): Promise<CharacterType> {
    return this.service.create(input as any);
  }

  @Mutation(() => CharacterType, { name: 'updateCharacter', nullable: true })
  @LogExecutionTime('GraphQL Mutation: updateCharacter')
  async updateCharacter(
    @Args('id', { type: () => Int }) id: number,
    @Args('input', { type: () => CharacterUpdateInput }) input: CharacterUpdateInput,
  ): Promise<CharacterType | null> {
    return this.service.update(id, input as any);
  }

  @Mutation(() => Boolean, { name: 'deleteCharacter' })
  @LogExecutionTime('GraphQL Mutation: deleteCharacter')
  async deleteCharacter(
    @Args('id', { type: () => Int }) id: number,
  ): Promise<boolean> {
    return this.service.remove(id);
  }
}
