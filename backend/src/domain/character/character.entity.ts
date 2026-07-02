// Pure TypeScript — no framework dependencies allowed in this file

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
  deletedAt: Date | null
  comments: Comment[]
  createdAt: Date
  updatedAt: Date
}

export interface Comment {
  id: string
  characterId: number
  content: string
  createdAt: Date
}
