/**
 * @openapi
 * tags:
 *   - name: System
 *     description: Health and status endpoints
 *   - name: Characters
 *     description: Query and manage Rick & Morty characters
 *   - name: Comments
 *     description: Add comments to characters
 *
 * components:
 *   schemas:
 *     Character:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         name:
 *           type: string
 *           example: Rick Sanchez
 *         status:
 *           type: string
 *           enum: [Alive, Dead, unknown]
 *           example: Alive
 *         species:
 *           type: string
 *           example: Human
 *         type:
 *           type: string
 *           example: ""
 *         gender:
 *           type: string
 *           enum: [Male, Female, Genderless, unknown]
 *           example: Male
 *         origin:
 *           type: string
 *           example: Earth (C-137)
 *         image:
 *           type: string
 *           format: uri
 *           example: https://rickandmortyapi.com/api/character/avatar/1.jpeg
 *         isFavorite:
 *           type: boolean
 *           example: false
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: null
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           example: a1b2c3d4-e5f6-7890-abcd-ef1234567890
 *         characterId:
 *           type: integer
 *           example: 1
 *         content:
 *           type: string
 *           example: Great character!
 *         createdAt:
 *           type: string
 *           format: date-time
 *     GraphQLRequest:
 *       type: object
 *       required:
 *         - query
 *       properties:
 *         query:
 *           type: string
 *           description: GraphQL query or mutation string
 *         variables:
 *           type: object
 *           description: Variables for the query or mutation
 */

/**
 * @openapi
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Health check
 *     description: Returns server status and current timestamp.
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-01T00:00:00.000Z"
 */

/**
 * @openapi
 * /graphql:
 *   post:
 *     tags: [GraphQL]
 *     summary: GraphQL endpoint
 *     description: |
 *       Single endpoint for all queries and mutations. Send a POST request with a `query` string and optional `variables` object.
 *
 *       > **Interactive explorer:** Open `/graphql` in your browser — Apollo Sandbox loads automatically and provides autocomplete, schema introspection, and query history.
 *
 *       ---
 *
 *       ## Data source
 *
 *       Characters are seeded from the [Rick & Morty public API](https://rickandmortyapi.com/) (first 15 characters).
 *       A cron job runs every 12 hours to keep them in sync. Characters are stored in PostgreSQL and served through this GraphQL layer.
 *
 *       ---
 *
 *       ## Available queries
 *
 *       ### `characters(filters)` — List characters
 *       Returns all characters. Supports the following filters (all optional):
 *
 *       | Filter | Type | Description |
 *       |--------|------|-------------|
 *       | `name` | String | Case-insensitive partial match |
 *       | `status` | String | `Alive` · `Dead` · `unknown` |
 *       | `species` | String | e.g. `Human`, `Alien` |
 *       | `gender` | String | `Male` · `Female` · `Genderless` · `unknown` |
 *       | `origin` | String | Case-insensitive partial match on origin name |
 *       | `sortBy` | String | `name_asc` (default) · `name_desc` |
 *       | `onlyFavorites` | Boolean | Return only favorite characters |
 *       | `includeDeleted` | Boolean | Include soft-deleted characters |
 *
 *       ### `character(id)` — Get character by ID
 *       Returns a single character with all fields and its associated comments.
 *
 *       ---
 *
 *       ## Available mutations
 *
 *       | Mutation | Description |
 *       |----------|-------------|
 *       | `toggleFavorite(id)` | Marks or unmarks a character as favorite. Invalidates Redis cache. |
 *       | `addComment(characterId, content)` | Creates a comment linked to a character. |
 *       | `softDeleteCharacter(id)` | Sets `deletedAt` on the character — does not delete the DB record. |
 *
 *       ---
 *
 *       ## Caching
 *
 *       Search results are cached in Redis with a 5-minute TTL. Cache is invalidated automatically on `toggleFavorite` and `softDeleteCharacter`.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - query
 *             properties:
 *               query:
 *                 type: string
 *                 description: GraphQL query or mutation string
 *               variables:
 *                 type: object
 *                 description: Variables referenced in the query
 *             example:
 *               query: "query($f: CharacterFiltersInput) { characters(filters: $f) { id name status species gender origin image isFavorite } }"
 *               variables:
 *                 f:
 *                   status: "Alive"
 *                   species: "Human"
 *                   sortBy: "name_asc"
 *           examples:
 *             query_allFilters:
 *               summary: "Query — All filters (start here)"
 *               value:
 *                 query: "query($f: CharacterFiltersInput) { characters(filters: $f) { id name status species gender origin image isFavorite } }"
 *                 variables:
 *                   f:
 *                     status: "Alive"
 *                     species: "Human"
 *                     gender: "Male"
 *                     origin: "Earth"
 *                     sortBy: "name_asc"
 *             query_listAll:
 *               summary: "Query — List all characters"
 *               value:
 *                 query: "{ characters { id name status species image isFavorite } }"
 *             query_filterByStatus:
 *               summary: "Query — Filter by status"
 *               value:
 *                 query: "query($filters: CharacterFiltersInput) { characters(filters: $filters) { id name status species image isFavorite } }"
 *                 variables:
 *                   filters:
 *                     status: Alive
 *             query_filterBySpecies:
 *               summary: "Query — Filter by species"
 *               value:
 *                 query: "query($filters: CharacterFiltersInput) { characters(filters: $filters) { id name status species image isFavorite } }"
 *                 variables:
 *                   filters:
 *                     species: Human
 *             query_filterByGender:
 *               summary: "Query — Filter by gender"
 *               value:
 *                 query: "query($filters: CharacterFiltersInput) { characters(filters: $filters) { id name status species gender image isFavorite } }"
 *                 variables:
 *                   filters:
 *                     gender: Male
 *             query_filterByName:
 *               summary: "Query — Search by name"
 *               value:
 *                 query: "query($filters: CharacterFiltersInput) { characters(filters: $filters) { id name status species image isFavorite } }"
 *                 variables:
 *                   filters:
 *                     name: Rick
 *             query_filterByOrigin:
 *               summary: "Query — Filter by origin"
 *               value:
 *                 query: "query($filters: CharacterFiltersInput) { characters(filters: $filters) { id name origin image isFavorite } }"
 *                 variables:
 *                   filters:
 *                     origin: Earth
 *             query_sortDescending:
 *               summary: "Query — Sort Z-A"
 *               value:
 *                 query: "query($filters: CharacterFiltersInput) { characters(filters: $filters) { id name species } }"
 *                 variables:
 *                   filters:
 *                     sortBy: name_desc
 *             query_getById:
 *               summary: "Query — Get character by ID (with comments)"
 *               value:
 *                 query: "query($id: Int!) { character(id: $id) { id name status species type gender origin image isFavorite deletedAt comments { id content createdAt } } }"
 *                 variables:
 *                   id: 1
 *             mutation_toggleFavorite:
 *               summary: "Mutation — Toggle favorite"
 *               value:
 *                 query: "mutation($id: Int!) { toggleFavorite(id: $id) { id isFavorite } }"
 *                 variables:
 *                   id: 1
 *             mutation_addComment:
 *               summary: "Mutation — Add comment"
 *               value:
 *                 query: "mutation($characterId: Int!, $content: String!) { addComment(characterId: $characterId, content: $content) { id content createdAt } }"
 *                 variables:
 *                   characterId: 1
 *                   content: Amazing character!
 *             mutation_softDelete:
 *               summary: "Mutation — Soft delete character"
 *               value:
 *                 query: "mutation($id: Int!) { softDeleteCharacter(id: $id) { id name deletedAt } }"
 *                 variables:
 *                   id: 1
 *     responses:
 *       200:
 *         description: GraphQL response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *             examples:
 *               success:
 *                 summary: Successful characters response
 *                 value:
 *                   data:
 *                     characters:
 *                       - id: 1
 *                         name: Rick Sanchez
 *                         status: Alive
 *                         species: Human
 *                         image: https://rickandmortyapi.com/api/character/avatar/1.jpeg
 *                         isFavorite: false
 *               error:
 *                 summary: Error response
 *                 value:
 *                   errors:
 *                     - message: Character 999 not found
 *                       locations:
 *                         - line: 1
 *                           column: 3
 */

export {}
