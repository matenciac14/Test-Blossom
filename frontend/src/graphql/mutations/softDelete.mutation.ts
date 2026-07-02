import { gql } from '@apollo/client'

export const SOFT_DELETE_CHARACTER = gql`
  mutation SoftDeleteCharacter($id: Int!) {
    softDeleteCharacter(id: $id) {
      id
      deletedAt
    }
  }
`
