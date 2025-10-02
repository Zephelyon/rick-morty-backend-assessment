import { CharacterType } from 'src/modules/characters/interfaces/graphql/dto/character.type';

// This test exists to execute the decorators in CharacterType and ensure the
// DTO file is imported and covered. It also verifies basic property assignment.
describe('CharacterType DTO', () => {
  it('can be instantiated and have fields assigned', () => {
    const c = new CharacterType();
    c.id = 1;
    c.name = 'Rick Sanchez';
    c.status = 'Alive';
    c.species = 'Human';
    c.gender = 'Male';
    c.origin = 'Earth';

    expect(c).toMatchObject({
      id: 1,
      name: 'Rick Sanchez',
      status: 'Alive',
      species: 'Human',
      gender: 'Male',
      origin: 'Earth',
    });
  });
});
