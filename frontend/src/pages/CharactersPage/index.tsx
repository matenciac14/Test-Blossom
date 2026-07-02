import { useState, useCallback } from 'react'
import { useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { GET_CHARACTERS } from '../../graphql/queries/characters.query'
import { Character, CharacterFilters } from '../../types/character.types'
import { SearchBar } from '../../components/SearchBar'
import { FilterPanel } from '../../components/FilterPanel'
import { CharacterList } from '../../components/CharacterList'
import { CharacterDetail } from '../../components/CharacterDetail'

export function CharactersPage() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const selectedId = id ? parseInt(id) : null

  const [showFilters, setShowFilters] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [sortBy, setSortBy] = useState<'name_asc' | 'name_desc'>('name_asc')
  const [appliedFilters, setAppliedFilters] = useState<CharacterFilters>({})
  const [draftFilters, setDraftFilters] = useState<CharacterFilters>({})

  const activeFilters: CharacterFilters = {
    ...appliedFilters,
    name: searchName || undefined,
    sortBy,
  }

  const { data, loading, error } = useQuery(GET_CHARACTERS, {
    variables: { filters: activeFilters },
  })

  const characters: Character[] = data?.characters ?? []

  const handleSelectCharacter = useCallback(
    (c: Character) => {
      navigate(`/character/${c.id}`)
      setShowFilters(false)
    },
    [navigate],
  )

  const handleBack = useCallback(() => navigate('/'), [navigate])

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters)
    setShowFilters(false)
  }

  const activeFilterCount = [
    appliedFilters.status,
    appliedFilters.species,
    appliedFilters.gender,
    appliedFilters.onlyFavorites,
    appliedFilters.onlyNonFavorites,
  ].filter(Boolean).length

  return (
    // CSS Grid — two-column layout on desktop (sidebar + detail panel)
    <div className="h-screen bg-gray-100 overflow-hidden grid grid-cols-1 md:grid-cols-[minmax(320px,384px)_1fr]">

      {/* ─── LEFT SIDEBAR ─── */}
      <div
        className={`flex flex-col bg-white border-r border-gray-200 overflow-hidden
          ${selectedId !== null ? 'hidden md:flex' : 'flex'}`}
      >
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900">Rick and Morty list</h1>
        </div>

        <SearchBar
          value={searchName}
          onChange={setSearchName}
          onFilterClick={() => {
            setDraftFilters(appliedFilters)
            setShowFilters(true)
          }}
          filterCount={activeFilterCount}
        />

        {showFilters ? (
          <FilterPanel
            filters={draftFilters}
            onFiltersChange={setDraftFilters}
            onApply={handleApplyFilters}
            onClose={() => setShowFilters(false)}
          />
        ) : (
          <>
            {activeFilterCount > 0 && (
              <div className="flex items-center justify-between px-4 py-2 bg-primary-100">
                <span className="text-xs text-primary-700 font-medium">
                  {characters.length} Results · {activeFilterCount} Filter{activeFilterCount > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => { setAppliedFilters({}); setDraftFilters({}) }}
                  className="text-xs text-primary-600 underline"
                >
                  Clear
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-7 h-7 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="flex-1 flex items-center justify-center text-sm text-red-400 p-4 text-center">
                Could not load characters. Is the backend running?
              </div>
            ) : (
              <CharacterList
                characters={characters}
                selectedId={selectedId}
                onSelect={handleSelectCharacter}
                sortBy={sortBy}
                onSortChange={setSortBy}
              />
            )}
          </>
        )}
      </div>

      {/* ─── RIGHT DETAIL PANEL ─── */}
      <div
        className={`bg-white overflow-hidden
          ${selectedId !== null ? 'flex flex-col' : 'hidden md:flex md:flex-col'}`}
      >
        {selectedId !== null ? (
          <CharacterDetail characterId={selectedId} onBack={handleBack} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 select-none">
            <svg className="w-20 h-20 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-lg font-medium">Select a character</p>
            <p className="text-sm mt-1">Click on any character to see the details</p>
          </div>
        )}
      </div>
    </div>
  )
}
