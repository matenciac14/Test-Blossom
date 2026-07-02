import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Rick and Morty API',
      version: '1.0.0',
      description: 'REST + GraphQL API for searching and managing Rick & Morty characters. Use the `/graphql` endpoint for all queries and mutations, or open it in your browser to launch Apollo Sandbox.',
    },
    servers: [
      { url: 'http://localhost:4000', description: 'Development' },
    ],
    tags: [
      { name: 'GraphQL', description: 'All queries and mutations — characters, comments, favorites, soft-delete' },
      { name: 'System', description: 'Health and status endpoints' },
    ],
  },
  apis: ['./src/application/swagger/routes.docs.ts'],
}

export const swaggerSpec = swaggerJsdoc(options)
