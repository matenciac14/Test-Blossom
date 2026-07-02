import { gql } from '@apollo/client'

export const ADD_COMMENT = gql`
  mutation AddComment($characterId: Int!, $content: String!) {
    addComment(characterId: $characterId, content: $content) {
      id
      content
      createdAt
    }
  }
`
