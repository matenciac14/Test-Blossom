import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rick and Morty API',
      version: '1.0.0',
      description: `
## Rick and Morty REST + GraphQL API

This server exposes two interfaces:

| Interface | URL | Description |
|---|---|---|
| **GraphQL** | \`/graphql\` | Main API — queries and mutations for characters and comments. Use Apollo Sandbox (dev) or any GraphQL client. |
| **REST** | \`/health\` | Health check endpoint |
| **Swagger** | \`/api-docs\` | This documentation |

### GraphQL Quick Reference

**Query characters:**
\`\`\`graphql
query {
  characters(filters: { status: "Alive", species: "Human", sortBy: "name_asc" }) {
    id name species status image isFavorite
  }
}
\`\`\`

**Toggle favorite:**
\`\`\`graphql
mutation { toggleFavorite(id: 1) { id isFavorite } }
\`\`\`

**Add comment:**
\`\`\`graphql
mutation { addComment(characterId: 1, content: "Great!") { id content createdAt } }
\`\`\`

**Soft delete:**
\`\`\`graphql
mutation { softDeleteCharacter(id: 1) { id deletedAt } }
\`\`\`
      `,
      contact: { name: 'Blossom Technical Test' },
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
      { url: 'https://your-backend.railway.app', description: 'Production' },
    ],
    tags: [
      { name: 'System', description: 'Health and status endpoints' },
    ],
  },
  apis: ['./src/application/swagger/routes.docs.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
