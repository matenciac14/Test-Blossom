import { gql } from 'graphql-tag'

export const typeDefs = gql`
  type Character {
    id: Int!
    name: String!
    status: String!
    species: String!
    type: String
    gender: String!
    origin: String!
    image: String!
    isFavorite: Boolean!
    deletedAt: String
    comments: [Comment!]!
    createdAt: String!
    updatedAt: String!
  }

  type Comment {
    id: String!
    characterId: Int!
    content: String!
    createdAt: String!
  }

  input CharacterFiltersInput {
    name: String
    status: String
    species: String
    gender: String
    origin: String
    sortBy: String
    includeDeleted: Boolean
    onlyFavorites: Boolean
    onlyNonFavorites: Boolean
  }

  type Query {
    characters(filters: CharacterFiltersInput): [Character!]!
    character(id: Int!): Character
  }

  type Mutation {
    toggleFavorite(id: Int!): Character!
    addComment(characterId: Int!, content: String!): Comment!
    softDeleteCharacter(id: Int!): Character!
  }
`
