# Ex0-Eva

## Connect Diractly

-   One-command setup ✨
    Run this in your terminal — it sets up everything for you: schema, packages, sample data, and a connection to your database in seconds.

```bash
npx --yes --package=prisma@latest -- prisma bootstrap --api-key "eyJraWQi••••••••••••" --database "db_cmpnt66bw03exzyf9f0natj3p"
```

-   Connection string
    For developers who know the setup. Add this to your project — built-in connection pooling handles concurrent connections automatically. No PgBouncer or extra infrastructure needed.

```bash
postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require
```

-   Without connection pooling
    Use for migrations, one-off scripts, or tools that manage their own connection pool.

```bash
postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@db.prisma.io:5432/postgres?sslmode=require
```

## Use an ORM

### Prisma ORM

#### Prompt your agent

Copy a prompt with everything your agent needs to connect to your Prisma Postgres database using Prisma ORM/Drizzle ORM/Kysely/TypeORM.

**Prisma ORM**

```prompt
Set up Prisma Postgres in this project end-to-end. Run all commands yourself in the terminal — don't ask me to run anything. Don't pause for confirmation between steps unless something fails.

DATABASE_ID: db_cmpnt66bw03exzyf9f0natj3p

Step 0 — Ground yourself in current docs.
Fetch https://www.prisma.io/docs/llms-full.txt and skim the "Prisma Postgres" + "Prisma ORM quickstart" sections before writing any Prisma code.

Step 1 — Locate the project root and install dependencies.
  Work in the app directory containing package.json. If the current directory has no package.json, inspect one level down for a single app directory with package.json and cd there. Only create package.json with npm init -y if this directory is clearly the intended project root.
  Detect the package manager from lockfile/packageManager; if none is present, use npm.
  Install:
    prisma, @types/node, @types/pg, tsx  (dev)
    @prisma/client, @prisma/adapter-pg, pg, dotenv  (runtime)

Step 2 — Link the existing database. Run this exact command without printing it back:
  PRISMA_API_KEY="eyJraWQiOiJUa0hEN1ltOUNaQ2xESHYwazEyTEFhWjk4NTdGOE16dWxYTXJBMFpqbWVrIiwiYWxnIjoiUlMyNTYifQ.eyJzdWIiOiJ3b3Jrc3BhY2U6Y21wbnQ1bXMzMDNtbjAwZmJyd3U3c2twaSIsImp0aSI6ImRnaG9xNjhpbjhvbTV3cmZxeGl5dWlkdCIsImlhdCI6MTc3OTg3MDg4OTkwMn0.GYVK0ptiTM__9RPR3Z0F5fSLkSsmTX1pEdB2LLm3d8e14VmZBUOCPzGP32FBvq53FTZdBo9-ewVAaBffVHGA7VQAe381us_6r2RykrhbXVvLYmAfYKhgghM3wCXYE50sZL2oJx_dIvPmMKodDvQcfLLm-DE3IwWtNt597EV0A8RhTVoC0E5sywIpefnBavWgthB0VlA5j4Sy84HlCeV7w_Vq804MJ2xKHVqwkX0auqS_qqDg8ab-PDNuJFNYJaZsfQYI3jvYLvknNwJhZG-zZ3g8W9_aRa52YsHq9P9ZF8YCEZBRJKe8PVOQvYn0gNTDOkY9dHjesU2jBOfbLVDZZg" npx --yes --package=prisma@latest -- prisma postgres link --database "db_cmpnt66bw03exzyf9f0natj3p"
  This writes DATABASE_URL to .env without browser auth when the database ID and API key are present. Use the DATABASE_ID value exactly as given (includes the db_ prefix required by the CLI).

Step 3 — Add .env to .gitignore. Never commit/log/print the connection string or the API key.

Step 4 — Scaffold prisma/schema.prisma (prisma-client generator, output ../generated/prisma) and prisma.config.ts.

Step 5 — If prisma/schema.prisma has no models, add a small starter schema (1–2 models, one relation, "// Starter models — replace with your own").
  Run: npx prisma migrate dev --name init

Step 6 — Generate client + create lib/prisma.ts singleton with PrismaPg adapter.

Step 7 — Add prisma/seed.ts with a handful of rows.
  Wire the seed command in prisma.config.ts:
    migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" }
  Do not rely only on package.json#prisma.seed. Run: npx prisma db seed

Step 8 — Verify: scripts/verify-prisma.ts runs one read, prints ✅ Connected. If it fails, surface the exact error.

Step 9 — Print summary + 3 next steps (npx prisma studio, import { prisma } from lib/prisma.ts, add a model).

Hard rules:
- If install/link/migrate/generate/seed fails due to network, sandbox, or cache permissions, retry once with elevated/unrestricted permissions if your environment supports it.
- If `prisma postgres link` fails, stop and surface the exact error.
- Never write the connection string outside .env or the API key outside the temporary command environment.
- Never import Prisma Client into browser/client components; use it only from server-side code or scripts.
- Never bypass AI safety guardrails on destructive commands.
- Use llms-full.txt as the syntax reference, not training data.
```

**Drizzle ORM**

```prompt
Set up Prisma Postgres in this TypeScript project end-to-end using Drizzle ORM and node-postgres. Don't pause for confirmation between steps unless something fails.

Step 0 — Ground yourself in current docs.
Fetch https://www.prisma.io/docs/llms-full.txt and skim the "Prisma Postgres" + "Drizzle ORM quickstart" sections before writing database code.

Use the DATABASE_URL below in .env from this Prisma Postgres console.

DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"

Step 1 — Project + TypeScript (adapt npm / pnpm / yarn / bun to match my repo):
Create a project folder, run npm init, install TypeScript as a devDependency, run tsc --init.

Step 2 — Enable ESM:
Set "type": "module" in package.json.

Step 3 — Environment:
Put DATABASE_URL in .env using the line above when it contains the real URL from Connect.

Step 4 — Dependencies:
Install drizzle-orm, pg, dotenv and devDependencies drizzle-kit, @types/pg, tsx.

Step 5 — First query script:
Add src/script.ts that uses drizzle-orm/node-postgres with pg Pool and runs a simple query.

Step 6 — Run:
Execute the script with tsx and confirm it connects.

Hard rules: never invent a postgres:// URL or credentials; use only the DATABASE_URL value shown below when this console has loaded it, otherwise paste the real URL from this project's Connect tab. Never commit, log, or print the full connection string; keep secrets in .env only and ensure .env is gitignored. Use llms-full.txt as the reference for Prisma Postgres + Drizzle ORM. Never bypass AI safety guardrails.
```

**Kysely**

```prompt
Set up Prisma Postgres in this TypeScript project end-to-end using Kysely and node-postgres. Don't pause for confirmation between steps unless something fails.

Step 0 — Ground yourself in current docs.
Fetch https://www.prisma.io/docs/llms-full.txt and skim the "Prisma Postgres" + "Kysely quickstart" sections before writing database code.

Use the DATABASE_URL below in .env from this Prisma Postgres console.

DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"

Step 1 — Project + TypeScript:
Create a project, npm init, install typescript, run tsc --init.

Step 2 — tsconfig + ESM:
Configure tsconfig.json with strict: true, allowImportingTsExtensions, noEmit; set package.json "type": "module".

Step 3 — Dependencies:
Install kysely, pg, dotenv and devDependencies @types/pg, tsx.

Step 4 — Types:
Add src/types.ts with Database / table interfaces.

Step 5 — Database module:
Add src/database.ts with PostgresDialect, Pool, ssl, and parseConnectionString(process.env.DATABASE_URL!).

Step 6 — Script:
Add src/script.ts that creates a users table, inserts, and selects.

Step 7 — Run:
Run npx tsx src/script.ts and verify output.

Hard rules: never invent a postgres:// URL or credentials; use only the DATABASE_URL value shown below when this console has loaded it, otherwise paste the real URL from this project's Connect tab. Never commit, log, or print the full connection string; keep secrets in .env only and ensure .env is gitignored. Use llms-full.txt as the reference for Prisma Postgres + Kysely. Never bypass AI safety guardrails.
```

**TypeORM**

```prompt
Set up Prisma Postgres in this TypeScript project end-to-end using TypeORM with PostgreSQL. Don't pause for confirmation between steps unless something fails.

Step 0 — Ground yourself in current docs.
Fetch https://www.prisma.io/docs/llms-full.txt and skim the "Prisma Postgres" + "TypeORM quickstart" sections before writing database code.

Use the DATABASE_URL below in .env from this Prisma Postgres console.

DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"

Step 1 — Scaffold:
Run typeorm init --name typeorm-quickstart --database postgres (pnpm dlx / yarn dlx / bunx per your setup).

Step 2 — Install:
cd into the project, install dependencies, add dotenv.

Step 3 — Environment:
Put DATABASE_URL in .env using the line above when it contains the real URL from Connect.

Step 4 — Data source:
Update src/data-source.ts to load dotenv, parse DATABASE_URL with URL(), spread host/port/username/password/database, set ssl: true, keep entities/migrations as generated.

Step 5 — Run:
Run npm start (or equivalent) and verify the sample inserts/queries.

Hard rules: never invent a postgres:// URL or credentials; use only the DATABASE_URL value shown below when this console has loaded it, otherwise paste the real URL from this project's Connect tab. Never commit, log, or print the full connection string; keep secrets in .env only and ensure .env is gitignored. Use llms-full.txt as the reference for Prisma Postgres + TypeORM. Never bypass AI safety guardrails.
```

---

#### Do it yourself

**Install Prisma ORM**
Install the packages shown below (use pnpm, yarn, or bun if you prefer). Then enable ESM: merge the tsconfig.json compilerOptions below and add type: module to package.json.

```bash
npm install prisma @types/node --save-dev
npm install @prisma/client @prisma/adapter-pg dotenv
```

**Create the project and TypeScript For Drizzle ORM**
Create a new folder, run npm init, install typescript as a dev dependency, and run tsc --init.

```bash
mkdir drizzle-quickstart && cd drizzle-quickstart
npm init -y
npm install --save-dev typescript
npx tsc --init
```

**Create the project and TypeScript For Kysely**
Create a new folder, run npm init, install typescript, and run tsc --init.

```bash
mkdir kysely-quickstart && cd kysely-quickstart
npm init -y
npm install --save-dev typescript
npx tsc --init
```

**Generate a TypeORM project**
Scaffold a starter with the TypeORM CLI (pnpm dlx / yarn dlx / bunx if you use those).

```bash
npx typeorm init --name typeorm-quickstart --database postgres
```

---

**Configure ESM**
Update tsconfig.json and package.json so Node treats the project as ESM.

```bash
// tsconfig.json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "esModuleInterop": true,
    "ignoreDeprecations": "6.0"
  }
}

// package.json — add alongside your existing fields:
{
  "type": "module"
}
```

**Initialize Prisma ORM**
Scaffold prisma/schema.prisma, prisma.config.ts, and .env. Then set DATABASE_URL using the value from the next step (same string as the Connect tab here when you are connected).

```bash
npx prisma init --output ../generated/prisma
```

**Add connection string to .env**
This line uses your generated connection string from this modal (pooled TCP or Accelerate URL), matching the Connect tab.

```.env
DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

**Define your schema**
Add models to prisma/schema.prisma. Edit fields to match your app when ready.

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

**Migrate and generate the client**
Create tables and regenerate Prisma Client into generated/prisma.

```bash
npx prisma migrate dev --name init
npx prisma generate
```

**Instantiate Prisma Client**
Use the PrismaPg adapter with your postgres connection string (TCP or pooled).

```ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

**Run a test query**
Save as script.ts (adjust import path if needed), then run npx tsx script.ts.

```ts
import { prisma } from "./lib/prisma";

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      posts: {
        create: {
          title: "Hello World",
          content: "This is my first post!",
          published: true,
        },
      },
    },
    include: { posts: true },
  });
  console.log("Created user:", user);

  const allUsers = await prisma.user.findMany({ include: { posts: true } });
  console.log("All users:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

---

### Drizzle

**Enable ESM**
Add type: module to package.json.

```
{
  "type": "module"
}
```

**Add DATABASE_URL to .env**
Uses the same connection string as the Connect tab here.

```
DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

**Install Drizzle and PostgreSQL driver**
Runtime: drizzle-orm, pg, dotenv. Dev: drizzle-kit, @types/pg, tsx.

```bash
npm install drizzle-orm pg dotenv
npm install --save-dev drizzle-kit @types/pg tsx
```

**Run a query script**
Save as src/script.ts, then run npx tsx src/script.ts.

```ts
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

const db = drizzle({ client: pool });

async function main() {
  const result = await db.execute("select 1");
  console.log("Query result:", result);
}

main()
  .then(async () => {
    await pool.end();
    console.log("Connection closed");
  })
  .catch(async (error) => {
    console.error("Error:", error);
    await pool.end();
    process.exit(1);
  });
```

---

### Kysely

**Configure TypeScript and ESM**
Set strict: true, allowImportingTsExtensions, noEmit in tsconfig.json and type: module in package.json.

```json
// tsconfig.json — set compilerOptions:
// "strict": true,
// "allowImportingTsExtensions": true,
// "noEmit": true

// package.json
{
  "type": "module"
}
```

**Add DATABASE_URL to .env**
Matches the Connect tab connection string.

```
DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

**Install Kysely and pg**
Install kysely, pg, dotenv and devDependencies @types/pg, tsx.

```bash
npm install kysely pg dotenv
npm install --save-dev @types/pg tsx
```

**Define database types**
Save as src/types.ts.

```ts
import type { Generated } from "kysely";

export interface Database {
  users: UsersTable;
}

export interface UsersTable {
  id: Generated<number>;
  email: string;
  name: string | null;
}
```

**Configure the database connection**
Save as src/database.ts with PostgresDialect and ssl: true.

```ts
import "dotenv/config";
import type { Database } from "./types.ts";
import { Pool } from "pg";
import { Kysely, PostgresDialect } from "kysely";

function parseConnectionString(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 5432,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.slice(1)),
  };
}

const connectionParams = parseConnectionString(process.env.DATABASE_URL!);

const dialect = new PostgresDialect({
  pool: new Pool({
    ...connectionParams,
    ssl: true,
    max: 10,
  }),
});

export const db = new Kysely<Database>({
  dialect,
});
```

**Run queries**
Save as src/script.ts, then run npx tsx src/script.ts.

```ts
import { db } from "./database.ts";

async function main() {
  await db.schema
    .createTable("users")
    .ifNotExists()
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("email", "varchar(255)", (col) => col.notNull().unique())
    .addColumn("name", "varchar(255)")
    .execute();

  const user = await db
    .insertInto("users")
    .values({
      email: "alice@prisma.io",
      name: "Alice",
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  console.log("Created user:", user);

  const users = await db.selectFrom("users").selectAll().execute();

  console.log("All users:", users);
}

main()
  .then(async () => {
    await db.destroy();
  })
  .catch(async (error) => {
    console.error("Error:", error);
    await db.destroy();
    process.exit(1);
  });
```

### TypeORM

**Install dependencies**
Enter the project folder, install packages, and add dotenv.

```bash
cd typeorm-quickstart
npm install
npm install dotenv
```

**Add DATABASE_URL to .env**
Same URL as this modal’s Connect tab.

```
DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

**Configure DataSource**
Replace src/data-source.ts to parse DATABASE_URL, enable ssl: true, and keep entities from the template.

```ts
import "reflect-metadata";
import "dotenv/config";
import { DataSource } from "typeorm";
import { User } from "./entity/User";

function parseConnectionString(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number.parseInt(parsed.port, 10) : 5432,
    username: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: decodeURIComponent(parsed.pathname.slice(1)),
  };
}

const connectionParams = parseConnectionString(process.env.DATABASE_URL!);

export const AppDataSource = new DataSource({
  type: "postgres",
  ...connectionParams,
  ssl: true,
  synchronize: true,
  logging: false,
  entities: [User],
  migrations: [],
  subscribers: [],
});
```

**Run the app**
Start the sample app (npm start, or pnpm / yarn / bun per your setup).

```bash
npm start
```

---

## Scaffold a project (Next.js Only)

### Prompt your agent

Copy a prompt with everything your agent needs to scaffold a new app with Prisma ORM and Prisma Postgres for the framework you selected.

```prompt
Scaffold a new Next.js project with Prisma ORM and Prisma Postgres. Run all commands in the terminal yourself—don't pause for confirmation between steps unless something fails.

Step 0 — Ground yourself in current docs.
Fetch https://www.prisma.io/docs/llms-full.txt and skim the "Prisma Postgres" + "Next.js with Prisma ORM" sections before writing database code.
Also skim the stack-specific walkthrough: https://www.prisma.io/docs/guides/frameworks/nextjs

Step 1 — Create the project from the official Prisma template (detect npm / pnpm / yarn / bun from the parent folder or use npm):
  npm create prisma@latest -- --template next
Accept CLI defaults unless I specify otherwise. Note the folder name you create (examples below use my-app).

Step 2 — Enter the project folder:
  cd my-app
If the CLI used a different directory name, cd into that folder instead.

Step 3 — Link Prisma Postgres (no browser auth).
From the new project root (directory with package.json), run this exact command without echoing secrets:
  PRISMA_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqd3RfaWQiOjEsInNlY3VyZV9rZXkiOiJza19aOTdjY1Jmd2VvR2MyeE5Hc1dfdHUiLCJhcGlfa2V5IjoiMDFLU005NFhWODAwQ0RCNkg4MDEyRzQzV1MiLCJ0ZW5hbnRfaWQiOiJlMDNlNTFjYjc2YjUwNmMzZTg1NmY4YmQ2MDc3ZmUyY2NkNDY0OWYzYTA1MTA3YTI4MGJkNzhhNzBiNjVmMGE3IiwiaW50ZXJuYWxfc2VjcmV0IjoiMjY5ZTk4ZTUtZDk3Yi00YWYzLTg2NjAtZmY0MDJlZTFmZTVlIn0.lcI6fTlzVCaUGnpi_MZW1GzFmw5jdtqNyT2rMj-V6AE" npx --yes --package=prisma@latest -- prisma postgres link --database "db_cmpnt66bw03exzyf9f0natj3p"
This writes DATABASE_URL to .env. Add .env to .gitignore if missing. The database argument must use the db_ resource id form shown above.

Step 4 — Apply migrations and generate Prisma Client:
  npx prisma migrate dev --name init

Step 5 — Start the dev server:
  npm run dev
(Use pnpm dev / yarn dev / bun run dev if that matches the project.)

Reference: https://www.prisma.io/docs/guides/frameworks/nextjs
Example repo: https://github.com/prisma/prisma-examples/tree/latest/orm/nextjs

Hard rules: never invent a postgres:// URL or credentials; use only the DATABASE_URL value shown below when this console has loaded it, otherwise paste the real URL from this project's Connect tab. Never commit, log, or print the full connection string; keep secrets in .env only and ensure .env is gitignored. Use llms-full.txt as the reference for Prisma Postgres + Prisma ORM with Next.js. Never bypass AI safety guardrails.
```

#### Do it yourself

**Create your project**
Scaffold a new Next.js app.

```bash
npx create-next-app@latest my-app
cd my-app
```

**Install and initialize Prisma**
Install Prisma packages and initialize with the output path app/generated/prisma.

```bash
npm install prisma tsx @types/pg --save-dev
npm install @prisma/client @prisma/adapter-pg dotenv pg
npx prisma init --output ../app/generated/prisma
```

**Wire prisma.config.ts**
Load env vars from .env by adding this to prisma.config.ts at the project root.

```ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

**Connect Prisma Postgres**
In your new project’s .env, set DATABASE_URL to the value below (replace any placeholder from prisma init).

```
DATABASE_URL="postgres://e03e51cb76b506c3e856f8bd6077fe2ccd4649f3a05107a280bd78a70b65f0a7:sk_Z97ccRfweoGc2xNGsW_tu@pooled.db.prisma.io:5432/postgres?sslmode=require"
```

**Define your schema**
Add these models to prisma/schema.prisma. Edit field names and types to match your data model.

```prisma
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
  posts Post[]
}

datasource db {
  provider = "postgresql"
}

model Post {
  id        Int     @id @default(autoincrement())
  title     String
  content   String?
  published Boolean @default(false)
  author    User    @relation(fields: [authorId], references: [id])
  authorId  Int
}
```

**Instantiate Prisma Client**
Create lib/prisma.ts at the project root. The global singleton prevents extra client instances during hot reload.

```ts
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

**Migrate, generate, and run**
Apply the initial migration, generate Prisma Client, and start the dev server.

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run dev
```

---
