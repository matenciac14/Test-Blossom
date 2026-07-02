import { Character } from '../../types/character.types'
import { FavoriteButton } from '../FavoriteButton'

interface Props {
  character: Character
  isSelected: boolean
  onSelect: (character: Character) => void
}

export function CharacterListItem({ character, isSelected, onSelect }: Props) {
  return (
    // div instead of button to avoid invalid nested <button> (FavoriteButton is a button too)
    <div
      role="button"
      aria-label={character.name}
      tabIndex={0}
      onClick={() => onSelect(character)}
      onKeyDown={(e) => e.key === 'Enter' && onSelect(character)}
      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors cursor-pointer ${
        isSelected ? 'bg-primary-100' : 'hover:bg-gray-50'
      }`}
    >
      <img
        src={character.image}
        alt={character.name}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{character.name}</p>
        <p className="text-xs text-gray-500 truncate">{character.species}</p>
      </div>
      <FavoriteButton characterId={character.id} isFavorite={character.isFavorite} />
    </div>
  )
}
