import { gql } from '@apollo/client'

export const GET_CHARACTERS = gql`
  query GetCharacters($filters: CharacterFiltersInput) {
    characters(filters: $filters) {
      id
      name
      status
      species
      type
      gender
      origin
      image
      isFavorite
      deletedAt
    }
  }
`

export const GET_CHARACTER = gql`
  query GetCharacter($id: Int!) {
    character(id: $id) {
      id
      name
      status
      species
      type
      gender
      origin
      image
      isFavorite
      deletedAt
      comments {
        id
        content
        createdAt
      }
    }
  }
`
