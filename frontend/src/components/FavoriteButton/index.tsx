import { useMutation } from '@apollo/client'
import { TOGGLE_FAVORITE } from '../../graphql/mutations/favorite.mutation'
import { GET_CHARACTERS } from '../../graphql/queries/characters.query'

interface Props {
  characterId: number
  isFavorite: boolean
  size?: 'sm' | 'md'
}

export function FavoriteButton({ characterId, isFavorite, size = 'sm' }: Props) {
  const [toggleFavorite, { loading }] = useMutation(TOGGLE_FAVORITE, {
    variables: { id: characterId },
    refetchQueries: [{ query: GET_CHARACTERS }],
    optimisticResponse: {
      toggleFavorite: { id: characterId, isFavorite: !isFavorite, __typename: 'Character' },
    },
  })

  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'

  return (
    <button
      data-testid={isFavorite ? 'heart-filled' : 'heart-outline'}
      onClick={(e) => {
        e.stopPropagation()
        toggleFavorite()
      }}
      disabled={loading}
      className="p-1 transition-transform hover:scale-110 disabled:opacity-50"
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      {isFavorite ? (
        <svg className={`${iconSize} text-secondary-600 fill-current`} viewBox="0 0 24 24">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ) : (
        <svg className={`${iconSize} text-gray-400 fill-none stroke-current`} viewBox="0 0 24 24" strokeWidth={1.5}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  )
}
