jest.mock('src/common/decorators/log-execution-time.decorator', () => ({
  LogExecutionTime: () => () => undefined,
}));

import {CharactersResolver} from "../../src/modules/characters/interfaces/graphql/characters.resolver";

describe('CharactersResolver.getCharactersRickAndMorty', () => {
  function makeResolver() {
    const service = { search: jest.fn() };
    const resolver = new CharactersResolver(service as any);
    return { resolver, service };
  }

  it('delegates to service.search with the provided filter and returns list', async () => {
    const { resolver, service } = makeResolver();
    const data = [{ id: 1, name: 'Rick Sanchez' }];
    (service.search as jest.Mock).mockResolvedValueOnce(data);

    const res = await resolver.getCharactersRickAndMorty({ name: 'Rick' } as any);

    expect(service.search).toHaveBeenCalledWith({ name: 'Rick' });
    expect(res).toEqual(data);
  });

  it('returns empty array when service returns non-array', async () => {
    const { resolver, service } = makeResolver();
    (service.search as jest.Mock).mockResolvedValueOnce(null);

    const res = await resolver.getCharactersRickAndMorty(undefined);

    expect(res).toEqual([]);
  });

  it('uses {} when filter is undefined', async () => {
    const { resolver, service } = makeResolver();
    (service.search as jest.Mock).mockResolvedValueOnce([]);

    await resolver.getCharactersRickAndMorty(undefined);

    expect(service.search).toHaveBeenCalledWith({});
  });
});
