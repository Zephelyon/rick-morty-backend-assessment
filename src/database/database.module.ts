import { Module } from '@nestjs/common';
import { databaseProviders } from './sequelize/sequelize.provider';

@Module({
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}
