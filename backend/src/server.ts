import 'reflect-metadata'
import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@apollo/server/express4'
import { typeDefs } from './application/graphql/schema/character.schema'
import { CharacterResolver } from './application/graphql/resolvers/character.resolver'
import { CharacterUseCase } from './domain/character/character.use-case'
import { CharacterRepository } from './infrastructure/db/character.repository'
import { RedisCache } from './infrastructure/cache/redis.cache'
import { RickMortyApiAdapter } from './infrastructure/external/rickmorty-api.adapter'
import { loggerMiddleware } from './application/middleware/logger.middleware'
import { initDatabase } from './infrastructure/db/models'
import { redisClient } from './infrastructure/cache/redis.client'
import { startCron } from './application/cron/update-characters.cron'
import { swaggerSpec } from './application/swagger/swagger.config'

const PORT = process.env.PORT ?? 4000

async function bootstrap(): Promise<void> {
  // Connect to DB and Redis
  await initDatabase()
  await redisClient.connect()

  // Dependency injection — wire up the hexagonal layers
  const repo = new CharacterRepository()
  const cache = new RedisCache()
  const rickMortyApi = new RickMortyApiAdapter()
  const useCase = new CharacterUseCase(repo, cache, rickMortyApi)
  const resolver = new CharacterResolver(useCase)

  // GraphQL resolvers map
  const resolvers = {
    Query: {
      characters: resolver.characters.bind(resolver),
      character: resolver.character.bind(resolver),
    },
    Mutation: {
      toggleFavorite: resolver.toggleFavorite.bind(resolver),
      addComment: resolver.addComment.bind(resolver),
      softDeleteCharacter: resolver.softDeleteCharacter.bind(resolver),
    },
  }

  // Apollo Server 4
  const apolloServer = new ApolloServer({ typeDefs, resolvers })
  await apolloServer.start()

  // Express app
  const app = express()
  app.use(cors({ origin: process.env.FRONTEND_URL ?? '*' }))
  app.use(express.json())
  app.use(loggerMiddleware)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app.use('/graphql', expressMiddleware(apolloServer) as any)

  app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
  app.get('/api-docs.json', (_, res) => res.json(swaggerSpec))

  // Start background cron
  startCron(useCase)

  app.listen(PORT, () => {
    console.log(`\n🚀 GraphQL  → http://localhost:${PORT}/graphql`)
    console.log(`📄 Swagger  → http://localhost:${PORT}/api-docs`)
    console.log(`❤️  Health   → http://localhost:${PORT}/health\n`)
  })
}

bootstrap().catch((err) => {
  console.error('Fatal error during bootstrap:', err)
  process.exit(1)
})
