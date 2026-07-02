import { gql } from '@apollo/client'

export const TOGGLE_FAVORITE = gql`
  mutation ToggleFavorite($id: Int!) {
    toggleFavorite(id: $id) {
      id
      isFavorite
    }
  }
`
