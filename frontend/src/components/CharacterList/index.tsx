import { Character } from '../../types/character.types'
import { CharacterListItem } from '../CharacterListItem'

interface Props {
  characters: Character[]
  selectedId: number | null
  onSelect: (character: Character) => void
  sortBy: 'name_asc' | 'name_desc'
  onSortChange: (sort: 'name_asc' | 'name_desc') => void
}

export function CharacterList({ characters, selectedId, onSelect, sortBy, onSortChange }: Props) {
  const starred = characters.filter((c) => c.isFavorite)
  const others = characters.filter((c) => !c.isFavorite)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Sort control */}
      <div className="flex items-center justify-end px-4 py-2 border-b border-gray-100">
        <button
          onClick={() => onSortChange(sortBy === 'name_asc' ? 'name_desc' : 'name_asc')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-primary-600 transition-colors font-medium"
          aria-label="Toggle sort order"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          {sortBy === 'name_asc' ? 'A → Z' : 'Z → A'}
        </button>
      </div>

      {starred.length > 0 && (
        <section>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Starred Characters ({starred.length})
          </p>
          {starred.map((c) => (
            <CharacterListItem
              key={c.id}
              character={c}
              isSelected={selectedId === c.id}
              onSelect={onSelect}
            />
          ))}
        </section>
      )}

      {others.length > 0 && (
        <section>
          <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Characters ({others.length})
          </p>
          {others.map((c) => (
            <CharacterListItem
              key={c.id}
              character={c}
              isSelected={selectedId === c.id}
              onSelect={onSelect}
            />
          ))}
        </section>
      )}

      {characters.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">No characters found</p>
        </div>
      )}
    </div>
  )
}
