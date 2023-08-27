# NestJS Template Project

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Useful NestJS CLI commands

```bash
# add modules
nest g module user
nest g module bookmark

# add services
nest g service prisma --no-spec

# add controllers
nest g service user --no-spec

# initialise prisma
npx prisma init

# generate and migrate db schema using prisma with name "init"
# the generated schema can be found under /prisma/migrations
npx  prisma migrate dev --name init

# inspect db schema in db
npx prisma studio
```

## 3rd Party Dependencies

```bash
# install prisma (development only)
yarn add -D prisma

# install prisma client
yarn add @prisma/client

# install class-validator and class-transformer for request validations and transformation pipes, e.g. ParseIntPipe
yarn add class-validator class-transformer

# install passport to add jwt support
yarn add @nestjs/jwt passport-jwt
yarn add -D @types/passport-jwt

# install dotenv (development only) to support reading from different .env files, e.g. .env.test
yaen yarn add -D dotenv-cli

```

## e2e testing with pectum

- inspect() - printout raw response data
- stores() - store session data, e.g. access_token, in pecturm context
- string interpolation - e.g. 'Bearer $S{access_token}' using `$S`
