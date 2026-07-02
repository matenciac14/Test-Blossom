# Rick and Morty — Blossom Technical Test

Full-stack application for searching and managing Rick & Morty characters.

**Live demo:** _coming soon_

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Apollo Client 3, TailwindCSS, React Router DOM 6 |
| Backend | Node.js, TypeScript, Express 4, Apollo Server 4 (GraphQL) |
| Database | PostgreSQL + Sequelize 6 (with migrations) |
| Cache | Redis (ioredis) |
| Testing | Vitest + Testing Library |
| Infra | Docker Compose |

## Architecture

The backend follows **Hexagonal Architecture (Ports & Adapters)**:

```
domain/          ← pure business logic, no framework dependencies
  character/
    character.entity.ts       ← TypeScript interfaces only
    character.use-case.ts     ← orchestrates all use cases
    character.types.ts        ← value objects, enums
  ports/
    character.repository.port.ts  ← DB interface
    cache.port.ts                 ← cache interface
    rickmorty-api.port.ts         ← external API interface

infrastructure/  ← concrete adapters
  db/            ← Sequelize implementation of repository port
  cache/         ← Redis implementation of cache port
  external/      ← Rick & Morty API HTTP adapter

application/     ← delivery layer (GraphQL, middleware, cron)
  graphql/       ← Apollo Server schema + resolvers
  middleware/    ← request logger
  decorators/    ← @Timing method decorator
  cron/          ← 12h character sync job
```

## ERD

```
characters
  id          INTEGER   PK   (Rick & Morty API ID)
  name        VARCHAR
  status      VARCHAR        (Alive / Dead / unknown)
  species     VARCHAR
  type        VARCHAR
  gender      VARCHAR
  origin      VARCHAR
  image       VARCHAR
  isFavorite  BOOLEAN   default false
  deletedAt   TIMESTAMP NULL (soft-delete)
  createdAt   TIMESTAMP
  updatedAt   TIMESTAMP

comments
  id          UUID      PK
  characterId INTEGER   FK → characters.id
  content     TEXT
  createdAt   TIMESTAMP
  updatedAt   TIMESTAMP
```

## Quick Start

### Prerequisites
- Docker + Docker Compose
- Node.js 20+
- npm or pnpm

### 1. Clone & setup

```bash
git clone <repo-url>
cd blossom-test
```

### 2. Start infrastructure

```bash
docker-compose up -d
# Starts PostgreSQL on :5432 and Redis on :6379
```

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npm run migrate     # create tables
npm run seed        # insert 15 characters from Rick & Morty API
npm run dev         # starts on http://localhost:4000/graphql
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev         # starts on http://localhost:5173
```

---

## GraphQL API

**Endpoint:** `http://localhost:4000/graphql`

### Queries

```graphql
# Get all characters with optional filters
query {
  characters(filters: {
    name: "Rick"
    status: "Alive"
    species: "Human"
    gender: "Male"
    origin: "Earth"
    sortBy: "name_asc"       # or "name_desc"
    onlyFavorites: true
    includeDeleted: false
  }) {
    id name status species image isFavorite
  }
}

# Get single character with comments
query {
  character(id: 1) {
    id name status species type gender origin image isFavorite deletedAt
    comments { id content createdAt }
  }
}
```

### Mutations

```graphql
# Toggle favorite
mutation { toggleFavorite(id: 1) { id isFavorite } }

# Add comment
mutation { addComment(characterId: 1, content: "Great!") { id content createdAt } }

# Soft delete
mutation { softDeleteCharacter(id: 1) { id deletedAt } }
```

---

## Running Tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

---

## Key Features

- **Hexagonal Architecture** — domain layer has zero framework dependencies
- **Redis Cache** — search results cached for 5 minutes, invalidated on mutations
- **Soft Delete** — characters are hidden, not destroyed (Sequelize `paranoid: true`)
- **@Timing Decorator** — logs execution time of GraphQL resolvers automatically
- **Cron Job** — syncs characters from Rick & Morty API every 12 hours
- **Responsive UI** — split view on desktop, stack navigation on mobile
- **TypeScript strict mode** — both frontend and backend

---

## Environment Variables

### Backend `.env`
```
DATABASE_URL=postgresql://blossom:blossom123@localhost:5432/rickmorty
REDIS_URL=redis://localhost:6379
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Frontend `.env`
```
VITE_GRAPHQL_URL=http://localhost:4000/graphql
```
