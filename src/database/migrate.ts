import 'dotenv/config';
import { Sequelize } from 'sequelize-typescript';
import { Umzug, SequelizeStorage } from 'umzug';
import chalk from 'chalk';
import { ConfigService } from '@nestjs/config';

async function getSequelize() {
  const configService = new ConfigService();

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
  });
  await sequelize.authenticate();
  return sequelize;
}

async function run() {
  const sequelize = await getSequelize();
  const migrationsGlob = `${__dirname.replace(/\\/g, '/')}/migrations/*.[jt]s`;

  // Helpful debug info to ensure we're connecting to the expected DB and loading the right migrations
  console.log(chalk.cyan('umzug'), 'DB:', {
    host: (sequelize.config as any).host,
    port: (sequelize.config as any).port,
    database: (sequelize.config as any).database,
  });
  console.log(chalk.cyan('umzug'), 'migrations glob:', migrationsGlob);

  const umzug = new Umzug({
    migrations: {
      glob: migrationsGlob,
      resolve: ({ name, path, context }) => {
        // Use require for CJS/TS compatibility when running via ts-node or compiled JS

        const mod = require(path!);
        return {
          name,
          up: async () => mod.up({ context }),
          down: async () => mod.down({ context }),
        };
      },
    },
    context: sequelize.getQueryInterface(),
    storage: new SequelizeStorage({ sequelize }),
    logger: {
      info: (msg: any) => console.log(chalk.cyan('umzug'), msg),
      warn: (msg: any) => console.warn(chalk.yellow('umzug'), msg),
      error: (msg: any) => console.error(chalk.red('umzug'), msg),
      debug: (msg: any) => console.debug(chalk.gray('umzug'), msg),
    },
  });

  const cmd = process.argv[2] || 'up';
  if (cmd === 'up') {
    await umzug.up();
    console.log(
      chalk.bgGreen.black(' MIGRATIONS '),
      chalk.green('Migrations applied'),
    );

    // Sanity-check: verify public.characters and public.origins exist
    try {
      const [charRows] = await sequelize.query(
        "select table_schema, table_name from information_schema.tables where table_schema = 'public' and table_name = 'characters';",
      );
      console.log(
        chalk.cyan('umzug'),
        'post-migrate characters table check:',
        charRows,
      );

      const [origRows] = await sequelize.query(
        "select table_schema, table_name from information_schema.tables where table_schema = 'public' and table_name = 'origins';",
      );
      console.log(
        chalk.cyan('umzug'),
        'post-migrate origins table check:',
        origRows,
      );
    } catch (e) {
      console.warn(
        chalk.yellow('umzug'),
        'post-migrate table check failed:',
        e,
      );
    }
  } else if (cmd === 'down') {
    await umzug.down({ to: 0 as unknown as string });
    console.log(
      chalk.bgYellow.black(' MIGRATIONS '),
      chalk.yellow('Migrations reverted'),
    );
  } else if (cmd === 'list') {
    const pending = await umzug.pending();
    console.log(
      chalk.bgBlue.white(' MIGRATIONS '),
      chalk.blue('Pending migrations:'),
      pending,
    );
  } else {
    console.error(
      chalk.bgRed.white(' ERROR '),
      chalk.red(`Unknown command ${cmd}`),
    );
    process.exit(1);
  }

  await sequelize.close();
}

run().catch((e) => {
  console.error(chalk.bgRed.white(' ERROR '), e);
  process.exit(1);
});
