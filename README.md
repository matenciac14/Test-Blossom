# Rick and Morty — Blossom Technical Test

Full-stack application for searching and managing Rick & Morty characters.

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

```mermaid
erDiagram
    characters {
        INTEGER     id          PK  "Rick and Morty API ID"
        VARCHAR     name
        VARCHAR     status          "Alive | Dead | unknown"
        VARCHAR     species
        VARCHAR     type            "Subspecies / occupation"
        VARCHAR     gender          "Male | Female | Genderless | unknown"
        VARCHAR     origin
        VARCHAR     image           "Avatar URL"
        BOOLEAN     isFavorite      "default false"
        TIMESTAMP   deletedAt       "NULL — soft-delete"
        TIMESTAMP   createdAt
        TIMESTAMP   updatedAt
    }

    comments {
        UUID        id          PK
        INTEGER     characterId FK
        TEXT        content
        TIMESTAMP   createdAt
        TIMESTAMP   updatedAt
    }

    characters ||--o{ comments : "has many"
```

## Running locally

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- Node.js 20+
- npm

### Step 1 — Clone

```bash
git clone <repo-url>
cd blossom-test
```

### Step 2 — Start PostgreSQL + Redis

```bash
docker-compose up -d
```

Wait ~5 seconds for the containers to be healthy before continuing.

### Step 3 — Backend

```bash
cd backend
cp .env.example .env   # default values work out of the box
npm install
npm run migrate        # creates tables in PostgreSQL
npm run seed           # fetches 15 characters from Rick & Morty API and inserts them
npm run dev            # http://localhost:4000/graphql
```

> The seed calls the public Rick & Morty API — internet connection required.

### Step 4 — Frontend

Open a new terminal tab:

```bash
cd frontend
cp .env.example .env   # points to http://localhost:4000/graphql
npm install
npm run dev            # http://localhost:5173
```

Open `http://localhost:5173` — the character list should load immediately.

### Verify everything is working

| URL | What you should see |
|---|---|
| `http://localhost:5173` | Character grid with 15 Rick & Morty characters |
| `http://localhost:4000/graphql` | Apollo Sandbox (interactive GraphQL explorer) |
| `http://localhost:4000/api-docs` | Swagger UI |
| `http://localhost:4000/health` | `{ "status": "ok" }` |

### Running tests

```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test
```

### Stopping

```bash
docker-compose down   # stops and removes containers (data is preserved in volumes)
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
