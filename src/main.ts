import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import chalk from 'chalk';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe with sensible defaults
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strip unknown properties
      transform: true, // transform payloads to DTO instances
      transformOptions: { enableImplicitConversion: true },
      forbidUnknownValues: false, // be tolerant for GraphQL inputs
    }),
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;
  await app.listen(port);

  const label = chalk.bgBlue.white.bold(' START ');
  const url = chalk.cyan(`http://localhost:${port}`);
  console.log(`${label} ${chalk.green('App running on')} ${url}`);
}

bootstrap();
