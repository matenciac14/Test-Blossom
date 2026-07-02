interface Props {
  value: string
  onChange: (value: string) => void
  onFilterClick: () => void
  filterCount?: number
}

export function SearchBar({ value, onChange, onFilterClick, filterCount = 0 }: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
      <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search or filter results"
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open filters"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M9 20h6" />
        </svg>
        {filterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary-600 text-white text-[10px] rounded-full flex items-center justify-center">
            {filterCount}
          </span>
        )}
      </button>
    </div>
  )
}
