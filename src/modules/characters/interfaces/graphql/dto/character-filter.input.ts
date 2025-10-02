import { InputType, Field } from '@nestjs/graphql';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min, Transform, Type } from '../../../../../common/validation/optional-validators';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

@InputType()
export class CharacterFilterInput {
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

  @Field({ nullable: true, description: 'Origin name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Transform(trim)
  origin?: string;

  @Field({ nullable: true, description: 'Max items to return', defaultValue: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field({ nullable: true, description: 'Items to skip (offset) for pagination', defaultValue: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
