import { CharacterFilters } from '../../types/character.types'

interface Props {
  filters: CharacterFilters
  onFiltersChange: (filters: CharacterFilters) => void
  onApply: () => void
  onClose: () => void
}

type PillGroupProps = {
  label: string
  options: { value: string; label: string }[]
  selected: string | undefined
  onChange: (value: string | undefined) => void
}

function PillGroup({ label, options, selected, onChange }: PillGroupProps) {
  return (
    <div className="mb-5">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(selected === opt.value ? undefined : opt.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selected === opt.value
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-primary-100'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const CHARACTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'favorites', label: 'Starred' },
  { value: 'others', label: 'Others' },
]

const SPECIES_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Human', label: 'Human' },
  { value: 'Alien', label: 'Alien' },
]

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Alive', label: 'Alive' },
  { value: 'Dead', label: 'Dead' },
  { value: 'unknown', label: 'Unknown' },
]

const GENDER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Genderless', label: 'Genderless' },
]

export function FilterPanel({ filters, onFiltersChange, onApply, onClose }: Props) {
  const update = (key: keyof CharacterFilters, value: string | undefined) => {
    onFiltersChange({ ...filters, [key]: value || undefined })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Close filters">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <PillGroup
          label="Characters"
          options={CHARACTER_OPTIONS}
          selected={filters.onlyFavorites ? 'favorites' : filters.onlyNonFavorites ? 'others' : ''}
          onChange={(v) =>
            onFiltersChange({
              ...filters,
              onlyFavorites: v === 'favorites' || undefined,
              onlyNonFavorites: v === 'others' || undefined,
            })
          }
        />
        <PillGroup
          label="Species"
          options={SPECIES_OPTIONS}
          selected={filters.species ?? ''}
          onChange={(v) => update('species', v)}
        />
        <PillGroup
          label="Status"
          options={STATUS_OPTIONS}
          selected={filters.status ?? ''}
          onChange={(v) => update('status', v)}
        />
        <PillGroup
          label="Gender"
          options={GENDER_OPTIONS}
          selected={filters.gender ?? ''}
          onChange={(v) => update('gender', v)}
        />
      </div>

      <div className="p-4 border-t border-gray-100">
        <button
          onClick={onApply}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Filter
        </button>
      </div>
    </div>
  )
}
