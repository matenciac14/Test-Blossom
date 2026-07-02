import { useQuery, useMutation } from '@apollo/client'
import { GET_CHARACTER } from '../../graphql/queries/characters.query'
import { SOFT_DELETE_CHARACTER } from '../../graphql/mutations/softDelete.mutation'
import { GET_CHARACTERS } from '../../graphql/queries/characters.query'
import { FavoriteButton } from '../FavoriteButton'
import { CommentSection } from '../CommentSection'

interface Props {
  characterId: number
  onBack?: () => void // used on mobile
}

export function CharacterDetail({ characterId, onBack }: Props) {
  const { data, loading, error } = useQuery(GET_CHARACTER, {
    variables: { id: characterId },
  })

  const [softDelete] = useMutation(SOFT_DELETE_CHARACTER, {
    variables: { id: characterId },
    refetchQueries: [{ query: GET_CHARACTERS }],
  })

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !data?.character) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
        Character not found
      </div>
    )
  }

  const { character } = data
  const occupation = character.type || character.species

  return (
    <div className="flex flex-col h-full">
      {/* Mobile back button */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-3 text-sm text-gray-600 hover:text-gray-900 border-b border-gray-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
      )}

      <div className="flex-1 overflow-y-auto p-6">
        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <img
              src={character.image}
              alt={character.name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-md"
            />
            <div className="absolute -bottom-1 -right-1">
              <FavoriteButton characterId={character.id} isFavorite={character.isFavorite} size="md" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 text-center">{character.name}</h2>
          {character.deletedAt && (
            <span className="mt-1 text-xs text-red-400 bg-red-50 px-2 py-0.5 rounded-full">Deleted</span>
          )}
        </div>

        {/* Info fields — CSS Grid for two-column layout */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 border-t border-gray-100 pt-4">
          <InfoField label="Specie" value={character.species} />
          <InfoField label="Status" value={character.status} />
          <InfoField label="Occupation" value={occupation} />
          <InfoField label="Gender" value={character.gender} />
          <InfoField label="Origin" value={character.origin} className="col-span-2" />
        </div>

        {/* Comments */}
        <div className="border-t border-gray-100 mt-4 pt-2">
          <CommentSection characterId={character.id} comments={character.comments} />
        </div>

        {/* Soft delete */}
        {!character.deletedAt && (
          <div className="mt-6">
            <button
              onClick={() => {
                if (confirm(`Remove ${character.name} from the list?`)) {
                  softDelete()
                }
              }}
              className="w-full py-2 text-sm text-red-400 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Remove character
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoField({ label, value, className = '' }: { label: string; value: string; className?: string }) {
  return (
    <div className={`border-b border-gray-100 pb-3 ${className}`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value || '—'}</p>
    </div>
  )
}
