import { RickMortyCharacter } from '../character/character.types'

export interface IRickMortyApiPort {
  fetchCharacters(page?: number): Promise<RickMortyCharacter[]>
  fetchCharacterById(id: number): Promise<RickMortyCharacter>
}
