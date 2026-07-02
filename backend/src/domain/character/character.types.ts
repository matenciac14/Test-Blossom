export interface CharacterFilters {
  name?: string
  status?: string
  species?: string
  gender?: string
  origin?: string
  sortBy?: 'name_asc' | 'name_desc'
  includeDeleted?: boolean
  onlyFavorites?: boolean
  onlyNonFavorites?: boolean
}

export interface RickMortyCharacter {
  id: number
  name: string
  status: string
  species: string
  type: string
  gender: string
  origin: { name: string; url: string }
  location: { name: string; url: string }
  image: string
  episode: string[]
  url: string
  created: string
}

export interface RickMortyApiResponse {
  info: { count: number; pages: number; next: string | null; prev: string | null }
  results: RickMortyCharacter[]
}
