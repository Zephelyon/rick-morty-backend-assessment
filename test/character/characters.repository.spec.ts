import { Op } from 'sequelize';
import { CharactersRepository } from '../../src/modules/characters/infrastructure/persistence/sequelize/characters.repository';

describe('CharactersRepository.findByFilter', () => {
  function makeRepo() {
    const findAll = jest.fn();
    const fakeSequelize = {
      getRepository: jest.fn(() => ({ findAll })),
    } as any;
    const repo = new CharactersRepository(fakeSequelize);
    return { repo, findAll };
  }

  it('builds where with iLike for provided fields and applies limit/offset', async () => {
    const { repo, findAll } = makeRepo();
    findAll.mockResolvedValue([]);

    await repo.findByFilter({
      name: 'Rick',
      status: 'Alive',
      limit: 10,
      offset: 5,
    });

    expect(findAll).toHaveBeenCalledTimes(1);
    const arg = findAll.mock.calls[0][0];

    expect(arg.order).toEqual([['id', 'ASC']]);
    expect(arg.limit).toBe(10);
    expect(arg.offset).toBe(5);

    expect(arg.where).toEqual({
      name: { [Op.iLike]: '%Rick%' },
      status: { [Op.iLike]: '%Alive%' },
    });
  });

  it('uses defaults when pagination is not provided', async () => {
    const { repo, findAll } = makeRepo();
    findAll.mockResolvedValue([]);

    await repo.findByFilter({});

    const arg = findAll.mock.calls[0][0];
    expect(arg.limit).toBe(50);
    expect(arg.offset).toBe(0);
  });

  it('adds iLike conditions for species, gender, and origin when provided', async () => {
    const { repo, findAll } = makeRepo();
    findAll.mockResolvedValue([]);

    await repo.findByFilter({
      species: 'Human',
      gender: 'Male',
      origin: 'Earth',
    } as any);

    const arg = findAll.mock.calls[0][0];
    expect(arg.where).toEqual({
      species: { [Op.iLike]: '%Human%' },
      gender: { [Op.iLike]: '%Male%' },
      origin: { [Op.iLike]: '%Earth%' },
    });
  });
});
