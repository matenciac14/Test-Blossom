# Blossom Technical Test — Rick & Morty App

## Qué es
Prueba técnica fullstack: búsqueda y gestión de personajes de Rick & Morty.
Repositorio público para evaluación de seniority.

## Stack

### Backend
- Node.js + TypeScript
- Express 4
- Apollo Server 4 (GraphQL)
- Sequelize 6 + PostgreSQL
- Redis (ioredis) — cache de queries
- node-cron — actualización cada 12h
- Vitest — unit tests
- swagger-ui-express + swagger-jsdoc — docs

### Frontend
- React 18 + TypeScript
- Apollo Client 3 (GraphQL)
- React Router DOM 6
- TailwindCSS 3
- Vitest + @testing-library/react — unit tests

### Infraestructura
- docker-compose.yml levanta Postgres + Redis (sin instalación manual)

## Arquitectura — Hexagonal (Backend)

```
backend/src/
  domain/
    character/
      character.entity.ts          ← tipo puro, sin Sequelize
      character.use-case.ts        ← lógica de búsqueda, favoritos, comentarios
      character.types.ts           ← enums, value objects
    ports/
      character.repository.port.ts ← interface del repositorio
      cache.port.ts                ← interface del cache
      rickmorty-api.port.ts        ← interface de la API externa
  infrastructure/
    db/
      models/
        Character.model.ts         ← modelo Sequelize
        Comment.model.ts
      migrations/                  ← migraciones Sequelize
      seeders/                     ← seed 15 personajes desde Rick & Morty API
      character.repository.ts      ← implementa character.repository.port
    cache/
      redis.cache.ts               ← implementa cache.port con ioredis
    external/
      rickmorty-api.adapter.ts     ← implementa rickmorty-api.port
  application/
    graphql/
      schema/
        character.schema.ts        ← typeDefs GraphQL
      resolvers/
        character.resolver.ts      ← resolvers, usa use cases
    middleware/
      logger.middleware.ts         ← imprime info de cada request
      timing.decorator.ts          ← @TimingDecorator mide ejecución de queries
    cron/
      update-characters.cron.ts    ← corre cada 12h, llama a la API externa
    server.ts
```

## Arquitectura — Frontend

```
frontend/src/
  pages/
    CharactersPage/                ← lista con filtros y sort
    CharacterDetailPage/           ← detalle, favoritos, comentarios
  components/
    CharacterCard/
    CharacterGrid/
    SearchFilters/
    SortControl/
    FavoriteButton/
    CommentSection/
    CommentForm/
  graphql/
    queries/
      characters.query.ts
      character.query.ts
    mutations/
      favorite.mutation.ts
      comment.mutation.ts
      softDelete.mutation.ts
  hooks/
    useCharacters.ts
    useCharacterDetail.ts
  types/
    character.types.ts
  lib/
    apollo.ts                      ← ApolloClient config
```

## Base de datos — Tablas principales

### characters
| Campo | Tipo | Notas |
|---|---|---|
| id | INTEGER PK | ID de Rick & Morty API |
| name | STRING | |
| status | ENUM(Alive, Dead, unknown) | |
| species | STRING | |
| gender | ENUM(Male, Female, Genderless, unknown) | |
| origin | STRING | nombre del origen |
| image | STRING | URL |
| isFavorite | BOOLEAN | default false |
| deletedAt | DATE NULL | soft-delete |
| createdAt | DATE | |
| updatedAt | DATE | |

### comments
| Campo | Tipo | Notas |
|---|---|---|
| id | UUID PK | |
| characterId | INTEGER FK | → characters.id |
| content | TEXT | |
| createdAt | DATE | |

## GraphQL API — Queries y Mutations

### Queries
```graphql
characters(
  name: String
  status: String
  species: String
  gender: String
  origin: String
  sortBy: String        # "name_asc" | "name_desc"
  includeDeleted: Boolean
): [Character!]!

character(id: Int!): Character
```

### Mutations
```graphql
toggleFavorite(id: Int!): Character!
addComment(characterId: Int!, content: String!): Comment!
softDeleteCharacter(id: Int!): Character!
```

## Cache Strategy
- Key: `characters:${JSON.stringify(filters)}` — hash de los filtros
- TTL: 5 minutos
- Invalidación: al hacer mutación (toggle favorite, soft delete)

## Reglas de desarrollo
- TypeScript estricto (`strict: true`) en ambos proyectos
- No `any` — si es necesario, usar `unknown` + type guard
- Todos los use cases en `domain/` son independientes de Express/Sequelize
- Las mutations invalidan el cache de Redis
- El cron job corre cada 12h y actualiza los 15 personajes del seed
- El method decorator `@Timing` se aplica en los resolvers de búsqueda
- Swagger documenta todos los endpoints HTTP (si aplica) — el grafo se documenta con introspection

## Comandos principales

```bash
# levantar infraestructura
docker-compose up -d

# backend
cd backend && npm install && npm run migrate && npm run seed && npm run dev

# frontend
cd frontend && npm install && npm run dev
```

## Despliegue

### Servicios (todos tienen free tier)
| Servicio | Plataforma | Notas |
|---|---|---|
| Frontend | **Vercel** | Deploy automático desde GitHub, dominio gratis |
| Backend | **Railway** | Node.js + variables de entorno, easy setup |
| PostgreSQL | **Railway** (plugin) | Provisionado en el mismo proyecto del backend |
| Redis | **Upstash** | Redis serverless, free tier 10k req/día |

### Por qué desplegado suma mucho
- El evaluador puede probar la app sin correr nada localmente
- Demuestra que entiendes el ciclo completo (dev → prod)
- Diferencia entre "código que funciona en mi máquina" y producto real
- La URL en el README es lo primero que abren

### Variables de entorno en prod
```env
# Backend (Railway)
DATABASE_URL=postgresql://...
REDIS_URL=rediss://...          # Upstash da URL con TLS
NODE_ENV=production
PORT=4000

# Frontend (Vercel)
VITE_GRAPHQL_URL=https://tu-backend.railway.app/graphql
```

### Flujo de deploy
1. Subir repo a GitHub (público)
2. Conectar Railway al repo → seleccionar `/backend` como root
3. Agregar PostgreSQL plugin en Railway → corre migrations automático con postbuild
4. Crear cuenta Upstash → copiar `REDIS_URL` a Railway env vars
5. Conectar Vercel al repo → seleccionar `/frontend` como root
6. Poner `VITE_GRAPHQL_URL` en Vercel env vars → deploy automático

---

## Conceptos Clave

### Arquitectura Hexagonal (Ports & Adapters)
**Qué es:** Patrón que separa la lógica de negocio del mundo exterior mediante interfaces llamadas "puertos".

**Cómo explicarlo:** "El dominio no sabe si está hablando con Postgres, MySQL, o un mock — solo conoce la interface `CharacterRepository`. La implementación concreta vive en infrastructure y se inyecta."

**En el código:**
```
domain/ports/character.repository.port.ts   ← interface (el puerto)
infrastructure/db/character.repository.ts   ← implementación (el adaptador)
```

**Por qué importa:** Si mañana cambias de Postgres a MongoDB, solo tocas el adaptador. El use case no cambia.

---

### Repository Pattern
**Qué es:** Abstracción sobre la capa de persistencia. El use case llama métodos como `findAll()`, `findById()`, `save()` — sin saber nada de SQL ni Sequelize.

**Cómo explicarlo:** "Es como un cajón organizado — yo le pido 'dame los personajes vivos' y él sabe cómo buscarlo en la DB. La lógica de negocio no escribe queries."

**Beneficio:** Testeable — en tests inyectas un `InMemoryCharacterRepository` en lugar del real.

---

### GraphQL vs REST
**Qué es:** GraphQL es un lenguaje de consulta donde el cliente decide qué campos recibe. REST entrega toda la entidad siempre.

**Cómo explicarlo:** "En REST haces GET /characters y recibes 20 campos. En GraphQL defines exactamente qué necesitas: `{ name, image, species }`. Menos over-fetching."

**Piezas clave:**
- **Schema:** contrato de tipos (lo que existe)
- **Query:** lectura de datos
- **Mutation:** escritura de datos
- **Resolver:** función que ejecuta cada query/mutation
- **Apollo Server:** framework que une Express + GraphQL

---

### Apollo Client (frontend)
**Qué es:** Librería que conecta React con el servidor GraphQL. Maneja fetching, cache y estado del servidor.

**Cómo explicarlo:** "Es el Axios/React Query del mundo GraphQL. `useQuery` hace el fetch y guarda el resultado en cache interno. `useMutation` ejecuta cambios y puedes invalidar queries relacionadas."

**Cache de Apollo:** Apollo Client cachea automáticamente por tipo + id. Cuando haces `toggleFavorite`, el componente que muestra ese personaje se re-renderiza solo.

---

### Redis y Cache
**Qué es:** Base de datos en memoria, ultra-rápida. Se usa para guardar resultados de queries costosas.

**Cómo explicarlo:** "La primera vez que alguien busca personajes 'Alive', consulta Postgres (lento). El resultado se guarda en Redis con TTL de 5 min. La segunda consulta idéntica responde en <1ms desde Redis."

**TTL (Time To Live):** tiempo de vida de una clave en Redis. Pasado ese tiempo, se borra automáticamente y la siguiente consulta va a Postgres de nuevo.

**Cache Invalidation:** cuando alguien cambia un personaje (favorito, soft-delete), borramos las claves de Redis afectadas para evitar datos desactualizados.

---

### Method Decorator (TypeScript)
**Qué es:** Función que envuelve un método para agregar comportamiento sin modificar su código. Parte de la metaprogramación.

**Cómo explicarlo:** "Pongo `@Timing` arriba de un resolver y automáticamente mide cuánto tarda sin que el resolver sepa que está siendo medido. Es como un interceptor transparente."

```typescript
@Timing
async characters(filters: CharacterFilters) {
  // este método no sabe que está siendo cronometrado
  return this.useCase.findAll(filters)
}
```

**Pattern:** Decorator Pattern (GoF) — agrega responsabilidad a un objeto/método sin modificarlo.

---

### Soft Delete
**Qué es:** En lugar de borrar el registro de la DB, se marca con una fecha en `deletedAt`. El registro sigue existiendo pero se filtra en las queries normales.

**Cómo explicarlo:** "Es como papelera de reciclaje — el dato no desaparece, solo se oculta. Útil para auditoría, recuperación de datos, o simplemente no romper relaciones en la DB."

**En Sequelize:** el flag `paranoid: true` lo maneja automáticamente — agrega `WHERE deletedAt IS NULL` a todas las queries.

---

### Migrations (Sequelize)
**Qué es:** Archivos versionados que describen cambios al esquema de la DB. Se ejecutan en orden para llevar la DB de un estado a otro.

**Cómo explicarlo:** "Es como git para la base de datos. En lugar de correr SQL a mano, tienes archivos `20240101-create-characters.ts` que saben cómo crear Y cómo deshacer ese cambio."

**up:** aplica el cambio. **down:** lo revierte.

---

### Seeders
**Qué es:** Scripts que insertan datos iniciales en la DB. No son migrations (no cambian el esquema), solo populan datos.

**En el reto:** el seeder llama a la Rick & Morty API y guarda 15 personajes en Postgres.

---

### Cron Job
**Qué es:** Tarea programada que corre en intervalos definidos por expresión cron.

**Expresión cron:** `0 */12 * * *` = "al minuto 0, cada 12 horas"

**En el reto:** cada 12 horas, el cron llama a la API de Rick & Morty y actualiza los personajes en la DB (por si cambiaron datos).

---

### Middleware (Express)
**Qué es:** Función que se ejecuta en el pipeline de cada request antes de llegar al handler final.

**Cómo explicarlo:** "Es como un guardia de seguridad — cada request pasa por él. Puede leer, modificar o rechazar el request antes de que llegue al resolver."

**En el reto:** el logger middleware imprime método, path, tiempo de respuesta y status de cada request.

---

### Swagger / OpenAPI
**Qué es:** Estándar para documentar APIs. `swagger-ui-express` genera una UI interactiva en `/api-docs` donde puedes explorar y probar la API.

**Nota:** GraphQL tiene su propio explorador (Apollo Sandbox) disponible en `/graphql` en dev. Swagger aplica para documentar los endpoints HTTP adicionales (health check, etc.).

---

### React SPA vs Next.js — Por qué usamos React puro aquí

#### Por qué el reto especifica React y no Next.js

El reto pide explícitamente **React 18 + React Router DOM**. Ese combo solo tiene sentido en una SPA (Single Page Application). Next.js tiene su propio sistema de routing y **no usa React Router DOM** — usarlo en Next.js sería ignorar un requisito del stack.

---

#### Diferencias fundamentales

| Característica | React (Vite/CRA) | Next.js |
|---|---|---|
| **Tipo** | SPA — todo corre en el browser | Framework fullstack — server + client |
| **Routing** | React Router DOM (manual, client-side) | File-based routing automático (`/app`, `/pages`) |
| **Rendering** | CSR — el browser renderiza todo | CSR + SSR + SSG + ISR (configurable por ruta) |
| **Build tool** | Vite (o CRA) — genera archivos estáticos | Next CLI — genera output híbrido |
| **Backend** | No incluye — necesitas uno separado | Puede incluir API Routes / Server Actions |
| **Deploy** | Cualquier CDN (archivos estáticos) | Requiere runtime Node.js o Vercel |
| **Complejidad** | Simple — solo frontend | Mayor — tienes que entender qué corre en server vs client |
| **Apollo Client** | Funciona directo sin fricción | Requiere configuración extra para hidratación SSR |

---

#### Cuándo usar cada uno

**Usa React puro (Vite) cuando:**
- El reto o equipo lo especifica
- La app es una herramienta interna / dashboard / admin
- No necesitas SEO (la data es privada o está detrás de auth)
- Quieres separación total frontend/backend
- Prototype rápido sin overhead de framework

**Usa Next.js cuando:**
- Necesitas SEO (blog, e-commerce, landing pages)
- Quieres SSG para performance máxima (páginas estáticas)
- Quieres Server Components para reducir JS en el cliente
- Necesitas API Routes sin montar un backend separado
- El stack del equipo ya lo usa (ej. Vercel ecosystem)

---

#### Lo que Next.js agrega sobre React

```
React puro:
  Browser → descarga JS → React renderiza → muestra contenido
  (el HTML inicial llega vacío — todo lo pinta el browser)

Next.js SSR:
  Browser → pide página → Next corre en server → HTML ya renderizado → browser muestra
  (luego React "hidrata" el HTML para que sea interactivo)

Next.js SSG:
  En build time → genera HTML estático → serve desde CDN
  (ultra rápido, sin server en runtime)
```

**Clave conceptual:** Next.js no reemplaza React — lo envuelve. Sigue siendo React, pero con superpoderes de rendering y un framework que toma decisiones por ti (routing, bundling, etc.).

---

#### En este proyecto

Usamos React + Vite porque:
1. El reto lo pide explícitamente (`React Router DOM`)
2. La app no necesita SEO — es una herramienta de búsqueda, no una página pública
3. El backend ya está separado (Express + Apollo) — no necesitamos API Routes de Next
4. Vite es más rápido en dev que Next.js para una SPA pura

---

## Pendientes / Checklist

### Backend
- [ ] Setup Express + Apollo Server 4
- [ ] Modelos Sequelize + migraciones
- [ ] Seed 15 personajes
- [ ] character.repository (Postgres)
- [ ] redis.cache adapter
- [ ] rickmorty-api.adapter
- [ ] character.use-case
- [ ] GraphQL schema + resolvers
- [ ] Logger middleware
- [ ] Timing decorator
- [ ] Cron job 12h
- [ ] Unit tests (use case + resolver)
- [ ] Swagger

### Frontend
- [ ] Setup React 18 + Apollo Client + Router
- [ ] CharactersPage con grid
- [ ] Filtros (Status, Species, Gender) + Sort A-Z/Z-A
- [ ] CharacterDetailPage
- [ ] FavoriteButton + toggle mutation
- [ ] CommentSection + CommentForm
- [ ] Soft-delete
- [ ] Responsive (Flexbox + Grid)
- [ ] Unit tests (3+ componentes)

### Infra
- [ ] docker-compose (Postgres + Redis)
- [ ] README completo con ERD
- [ ] Git con commits semánticos
