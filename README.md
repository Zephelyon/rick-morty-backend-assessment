# Rick & Morty GraphQL API — Backend (NestJS, Sequelize, PostgreSQL, Redis)

GraphQL API that fetches and stores Rick & Morty characters in PostgreSQL, with Redis caching and Sequelize migrations. This README provides a clean, professional guide to run the project, understand the stack, and use the API with and without Docker.

- GraphQL operation: getCharactersRickAndMorty
- HTTP endpoint: POST /api/rick-and-morty
- API Docs: http://localhost:3000/docs (Redocly) and http://localhost:3000/openapi.yaml (Swagger YAML)


## Table of contents
- Overview
- Tech stack
- Requirements
- Environment variables
- Getting started
  - Run with Docker
  - Run locally (without Docker)
- Database
  - Migrations
  - Seeds
- Testing
- API usage examples
  - GraphQL Playground
  - HTTP JSON request/response
- Troubleshooting


## Overview
This service exposes a single GraphQL query, getCharactersRickAndMorty, which returns a list of characters stored in a PostgreSQL database. Results are cached in Redis to improve performance for repeated queries. Data can be seeded from the public Rick & Morty GraphQL API.


## Tech stack
- Runtime: Node.js, TypeScript
- Framework: NestJS 11
- GraphQL: @nestjs/graphql + apollo-server-express (GraphQL over HTTP)
- Database: PostgreSQL + Sequelize/Sequelize‑Typescript
- Migrations: Umzug
- Cache: Redis (cache-manager + cache-manager-redis-store)
- HTTP Docs: OpenAPI v3 served with Redocly
- Tests: Jest + @nestjs/testing + Supertest
- Containerization: Docker Compose


## Requirements
- Node.js 18+ and npm 10+
- Docker and Docker Compose (optional but recommended for local infra)
- PostgreSQL 16+ (if running without Docker)
- Redis 7+ (if running without Docker)


## Environment variables
Create a .env file at the project root. Defaults shown are suitable for local development:

```
# Application
NODE_ENV=development
PORT=3000

# Postgres
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=rick_morty

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

Tip: You can copy from .env into your shell or override via environment when using Docker Compose.


## Getting started
Install dependencies:

```
npm install
```

### Run with Docker (recommended)
This starts Postgres and Redis via Docker Compose and runs the app on your machine.

1) Start services
```
docker-compose up -d
```

2) Apply database migrations
```
npm run migrate
```

3) Seed sample data (15 characters)
```
npm run seed
```

4) Start the application (watch mode)
```
npm run start:dev
```

- App: http://localhost:3000
- GraphQL endpoint: http://localhost:3000/api/rick-and-morty
- API docs (Redoc): http://localhost:3000/docs
- OpenAPI YAML: http://localhost:3000/openapi.yaml

To stop infra services:
```
docker-compose down
```

### Run locally (without Docker)
Use this if you already have PostgreSQL and Redis installed natively.

1) Ensure PostgreSQL and Redis are running and match your .env values.
2) Install dependencies
```
npm install
```
3) Run migrations
```
npm run migrate
```
4) Seed initial data (optional but recommended)
```
npm run seed
```
5) Start the app
```
npm run start:dev
```


## Database
Sequelize + Umzug handle schema changes.

### Migrations
- Apply all: `npm run migrate`
- Revert all: `npm run migrate:down`
- List pending: `npm run migrate:list`

By default, migrations are loaded from src/database/migrations. If you need a reference schema, see rick_morty_schema.sql at the repository root.

### Seeds
Run: `npm run seed`

The seed script fetches 15 characters from https://rickandmortyapi.com/graphql and inserts them if the table is empty. Origins are normalized and linked where available.


## Testing
- Unit tests: `npm run test`
- Watch mode: `npm run test:watch`
- Coverage: `npm run test:coverage`

Tests use Jest and Nest’s testing utilities. Ensure your environment variables are configured for a test database if your tests touch the DB layer.


## API usage examples
The API exposes a single HTTP endpoint that executes GraphQL.

- Method: POST
- URL: http://localhost:3000/api/rick-and-morty
- Content-Type: application/json
- Operation: getCharactersRickAndMorty

### GraphQL Playground example
Open http://localhost:3000/api/rick-and-morty in your browser and run:

```
query ($filter: CharacterFilterInput) {
  getCharactersRickAndMorty(filter: $filter) {
    id
    name
    status
    species
    gender
    origin
  }
}
```

Variables:
```
{
  "filter": {
    "name": "Rick",
    "species": "Human",
    "status": "Alive",
    "gender": "Male",
    "origin": "Earth"
  }
}
```

Parameters supported by filter:
- name: string
- status: string (Alive, Dead, unknown)
- species: string
- gender: string
- origin: string

Additional Parameters by filter
- limit: integer (default 50)
- offset: integer (default 0)

### HTTP JSON example request
```
{
  "query": "query ($filter: CharacterFilterInput) { getCharactersRickAndMorty(filter: $filter) { id name status species gender origin } }",
  "variables": {
    "filter": { "name": "Rick", "species": "Human" }
  }
}
```

### HTTP JSON example response
```
{
  "data": {
    "getCharactersRickAndMorty": [
      { "id": 1, "name": "Rick Sanchez", "status": "Alive", "species": "Human", "gender": "Male", "origin": "Earth (C-137)" },
      { "id": 2, "name": "Morty Smith", "status": "Alive", "species": "Human", "gender": "Male", "origin": "Earth (C-137)" }
    ]
  }
}
```


## Troubleshooting
- Database connection errors: verify Postgres is reachable (host/port/user/password/db) and that migrations have been applied.
- Redis connection errors: confirm REDIS_HOST/REDIS_PORT and that the container is running.
- Port conflicts: change PORT in .env or stop the service using that port.
- Migrations not found: ensure files exist in src/database/migrations. As a fallback, you can create the schema using rick_morty_schema.sql and then run the app.


—
License: UNLICENSED
