import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { request, gql } from 'graphql-request';
import { Character } from '../sequelize/models/characters.model';
import { Origin } from '../sequelize/models/origin.model';
import { ConfigService } from '@nestjs/config';

async function getSequelize() {
  const configService = new ConfigService();

  // Ensure env vars are loaded and types are correct
  const host = configService.get<string>('DB_HOST');
  const port = configService.get<number>('DB_PORT');
  const username = configService.get<string>('DB_USER');
  const password = configService.get<string>('DB_PASSWORD');
  const database = configService.get<string>('DB_NAME');

  const sequelize = new Sequelize({
    dialect: 'postgres',
    host,
    port,
    username,
    password,
    database,
    logging: false,
    models: [Character, Origin],
  });
  await sequelize.authenticate();
  return sequelize;
}

async function fetchCharacters(limit = 15) {
  const endpoint = 'https://rickandmortyapi.com/graphql';
  const query = gql`
    query {
      characters(page: 1) {
        results {
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
    name: c.name,
    status: c.status ?? null,
    species: c.species ?? null,
    gender: c.gender ?? null,
    origin: c.origin?.name ?? null,
  }));
}

async function run() {
  const sequelize = await getSequelize();
  try {
    const payload = await fetchCharacters(15);
    const repo = sequelize.getRepository(Character);
    const originRepo = sequelize.getRepository(Origin);
    const count = await repo.count();
    if (count === 0) {
      for (const c of payload) {
        let originId: number | null = null;
        if (c.origin) {
          const [o] = await originRepo.findOrCreate({
            where: { name: c.origin },
            defaults: { name: c.origin },
          });
          originId = (o as any).id as number;
        }
        await repo.create({
          name: c.name,
          status: c.status,
          species: c.species,
          gender: c.gender,
          origin: c.origin,
          originId,
        } as any);
      }
      console.log(`Seeded ${payload.length} characters.`);
    } else {
      console.log(
        `Characters table already has ${count} rows. Skipping seeding.`,
      );
    }
  } finally {
    await sequelize.close();
  }
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
