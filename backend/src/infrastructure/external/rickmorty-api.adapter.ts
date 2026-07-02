import axios from 'axios'
import { IRickMortyApiPort } from '../../domain/ports/rickmorty-api.port'
import { RickMortyCharacter, RickMortyApiResponse } from '../../domain/character/character.types'

const BASE_URL = 'https://rickandmortyapi.com/api'

export class RickMortyApiAdapter implements IRickMortyApiPort {
  async fetchCharacters(page = 1): Promise<RickMortyCharacter[]> {
    const response = await axios.get<RickMortyApiResponse>(
      `${BASE_URL}/character?page=${page}`,
    )
    return response.data.results
  }

  async fetchCharacterById(id: number): Promise<RickMortyCharacter> {
    const response = await axios.get<RickMortyCharacter>(`${BASE_URL}/character/${id}`)
    return response.data
  }
}
