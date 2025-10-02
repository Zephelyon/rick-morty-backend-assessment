import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType('Character')
export class CharacterType {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  species?: string;

  @Field({ nullable: true })
  gender?: string;

  @Field({ nullable: true, description: 'Origin name' })
  origin?: string;
}
