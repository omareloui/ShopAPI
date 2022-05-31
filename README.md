# Storefront Backend Project

A shop api to control authentication, users, products, and orders. Available end-points can be found in the [REQUIREMENTS.md](/REQUIREMENTS.md) file.

## Set up and available scripts

### Building and testing

After cloning the code you need to install the dependencies. You can use `npm` but it's advisable to use `pnpm` instead.

```bash
pnpm i # or npm i
```

To start postgres database from the provided `docker-compose.yml` (after setting up the [.env](#env) file).

```bash
docker compose up postgres -d
```

To run database migrations run

```bash
pnpm migrate # or npm run migrate
```

To run the tests run

```bash
pnpm test # or npm test
```

Then, to build and use the application you need to run.

```bash
pnpm build # or npm run build
pnpm start # or npm start
```

### Linting and formatting

As for linting and formatting there is scripts for those too.

```bash
# Formatting
pnpm format # or npm run format

# Linting
pnpm lint # or npm run lint
```

### <a name="env"></a>`.env` file

You need to create `.env` file in the root directory to define the configs for the projects

#### Expected options

```env
HOST=
PORT=
PORT_TEST=

PGPORT=
PGUSER=
PGPASSWORD=
PGDATABASE=
PGDATABASE_TEST=

SALT_ROUNDS=
PASSWORD_PEPPER=

JWT_SECRET=
JWT_EXPIRES_IN=
```

##### **Server**

- `HOST` the server host. Defaults to `"127.0.0.1"`. Expects a string.
- `POST` the server port. Defaults to `3000`. Expects a number.
- `POST_TEST` the server port on testing. Defaults to `4000`. Expects a number.

##### **Postgres**

- `PGPORT` postgres' port. Expects a number.
- `PGUSER` postgres' user. Expects a string.
- `PGPASSWORD` postgres' password. Expects a string.
- `PGDATABASE` postgres' database name. Expects a string.
- `PGDATABASE_TEST` postgres' testing database name. Expects a string.

##### **Password**

- `SALT_ROUNDS` the salt hashing rounds for the passwords. Expects a number.
- `PASSWORD_PEPPER` the passwords pepper. Expects a string.

##### **JWT**

- `JWT_SECRET` the secret to create a validate the JWTs. Expects a string.
- `JWT_EXPIRES_IN` the time the JWT should expire after. Expects a string (eg. "2d" will wait 2 days to expire the token) or a number to define the number of seconds to revoke the token after.
