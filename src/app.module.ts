import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { CharactersModule } from './modules/characters/interfaces/characters.module';
import { DatabaseModule } from './database/database.module';
import { HttpLoggerMiddleware } from './common/middleware/http-logger.middleware';
import { ScheduleModule } from '@nestjs/schedule';
import { DocsModule } from './docs/docs.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      path: '/api/rick-and-morty',
      autoSchemaFile: true,
      playground: true,
      sortSchema: true,
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    CharactersModule,
    DocsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
