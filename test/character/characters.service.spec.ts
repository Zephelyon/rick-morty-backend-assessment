import {CharactersService} from "../../src/modules/characters/application/characters.service";


describe('CharactersService.search', () => {
  function makeService() {
    const repo = { findByFilter: jest.fn() };
    const redis = { get: jest.fn(), set: jest.fn() };
    const service = new CharactersService(repo as any, redis as any);
    return { service, repo, redis };
  }

  it('returns cached results when present and does not hit repository', async () => {
    const { service, repo, redis } = makeService();
    const cached = [{ id: 1, name: 'Rick Sanchez' }];
    (redis.get as jest.Mock).mockResolvedValueOnce(cached);

    const res = await service.search({ name: 'Rick' } as any);

    expect(res).toEqual(cached);
    expect(repo.findByFilter).not.toHaveBeenCalled();
    expect(redis.set).not.toHaveBeenCalled();
  });

  it('queries repository on cache miss, maps rows to plain objects and stores in cache with TTL=120', async () => {
    const { service, repo, redis } = makeService();
    (redis.get as jest.Mock).mockResolvedValueOnce(null);

    const modelRow = {
      get: ({ plain }: { plain: boolean }) => ({ id: 2, name: 'Morty Smith', plain }),
    };
    (repo.findByFilter as jest.Mock).mockResolvedValueOnce([modelRow]);

    const result = await service.search({ status: 'Alive', name: 'Morty' } as any);

    expect(repo.findByFilter).toHaveBeenCalledWith({ status: 'Alive', name: 'Morty' });
    expect(result).toEqual([{ id: 2, name: 'Morty Smith', plain: true }]);

    expect(redis.set).toHaveBeenCalledTimes(1);
    const [key, value, ttl] = (redis.set as jest.Mock).mock.calls[0];
    expect(key).toMatch(/^characters:/);
    expect(value).toEqual(result);
    expect(ttl).toBe(120);
  });

  it('generates the same cache key regardless of filter key order', async () => {
    const { service, redis, repo } = makeService();
    (redis.get as jest.Mock).mockResolvedValue(null);
    (repo.findByFilter as jest.Mock).mockResolvedValue([]);

    await service.search({ name: 'Rick', status: 'Alive' } as any);
    await service.search({ status: 'Alive', name: 'Rick' } as any);

    const firstKey = (redis.get as jest.Mock).mock.calls[0][0];
    const secondKey = (redis.get as jest.Mock).mock.calls[1][0];

    expect(firstKey).toMatch(/^characters:/);
    expect(secondKey).toMatch(/^characters:/);
    expect(firstKey).toBe(secondKey);
  });

  it('handles rows without a get() method', async () => {
    const { service, repo, redis } = makeService();
    (redis.get as jest.Mock).mockResolvedValueOnce(null);
    (repo.findByFilter as jest.Mock).mockResolvedValueOnce([{ id: 3, name: 'Summer Smith' }]);

    const result = await service.search({} as any);
    expect(result).toEqual([{ id: 3, name: 'Summer Smith' }]);
  });

  it('accepts non-object filters (e.g., null) and still works', async () => {
    const { service, repo, redis } = makeService();
    (redis.get as jest.Mock).mockResolvedValueOnce(null);
    (repo.findByFilter as jest.Mock).mockResolvedValueOnce([]);

    await service.search(null as any);

    // Should call repo with the same value (null) and set cache
    expect(repo.findByFilter).toHaveBeenCalledWith(null);
    expect(redis.set).toHaveBeenCalledTimes(1);
  });

  it('accepts truthy non-object filters (e.g., string) to cover stableStringify branch', async () => {
    const { service, repo, redis } = makeService();
    (redis.get as jest.Mock).mockResolvedValueOnce(null);
    (repo.findByFilter as jest.Mock).mockResolvedValueOnce([]);

    await service.search('Rick' as any);

    expect(repo.findByFilter).toHaveBeenCalledWith('Rick');
    expect(redis.set).toHaveBeenCalledTimes(1);
  });
});
