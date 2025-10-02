import { Sequelize } from 'sequelize-typescript';
import type { Provider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Character } from './models/characters.model';
import { Origin } from './models/origin.model';

export const SEQUELIZE = 'SEQUELIZE';

export const databaseProviders: Provider[] = [
  {
    provide: SEQUELIZE,
    useFactory: async (configService: ConfigService) => {
      const host = configService.get<string>('DB_HOST');
      const portRaw = configService.get<string>('DB_PORT');
      const username = configService.get<string>('DB_USER');
      const password = configService.get<string>('DB_PASSWORD');
      const database = configService.get<string>('DB_NAME');

      const sequelize = new Sequelize({
        dialect: 'postgres',
        host,
        port: portRaw ? Number(portRaw) : 5432,
        username,
        password,
        database,
        models: [Character, Origin],
        logging: false,
      });
      await sequelize.authenticate();
      return sequelize;
    },
    inject: [ConfigService],
  },
];
