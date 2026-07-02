import { Character, Comment } from '../character/character.entity'
import { CharacterFilters } from '../character/character.types'

export interface ICharacterRepository {
  findAll(filters: CharacterFilters): Promise<Character[]>
  findById(id: number): Promise<Character | null>
  update(id: number, data: Partial<Character>): Promise<Character>
  addComment(characterId: number, content: string): Promise<Comment>
  softDelete(id: number): Promise<Character>
  upsertMany(characters: Partial<Character>[]): Promise<void>
}
