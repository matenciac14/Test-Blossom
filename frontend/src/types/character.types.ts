export interface Character {
  id: number
  name: string
  status: string
  species: string
  type: string
  gender: string
  origin: string
  image: string
  isFavorite: boolean
  deletedAt: string | null
  comments: Comment[]
}

export interface Comment {
  id: string
  characterId: number
  content: string
  createdAt: string
}

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
