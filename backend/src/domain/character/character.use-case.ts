import { Character, Comment } from './character.entity'
import { CharacterFilters } from './character.types'
import { ICharacterRepository } from '../ports/character.repository.port'
import { ICachePort } from '../ports/cache.port'
import { IRickMortyApiPort } from '../ports/rickmorty-api.port'

const CACHE_TTL_SECONDS = 300 // 5 minutes

export class CharacterUseCase {
  constructor(
    private readonly repo: ICharacterRepository,
    private readonly cache: ICachePort,
    private readonly rickMortyApi?: IRickMortyApiPort,
  ) {}

  async findAll(filters: CharacterFilters): Promise<Character[]> {
    const cacheKey = `characters:${JSON.stringify(filters)}`
    const cached = await this.cache.get<Character[]>(cacheKey)
    if (cached) return cached

    const characters = await this.repo.findAll(filters)
    await this.cache.set(cacheKey, characters, CACHE_TTL_SECONDS)
    return characters
  }

  async findById(id: number): Promise<Character | null> {
    return this.repo.findById(id)
  }

  async toggleFavorite(id: number): Promise<Character> {
    const character = await this.repo.findById(id)
    if (!character) throw new Error(`Character ${id} not found`)

    const updated = await this.repo.update(id, { isFavorite: !character.isFavorite })
    await this.cache.invalidatePattern('characters:*')
    return updated
  }

  async addComment(characterId: number, content: string): Promise<Comment> {
    const character = await this.repo.findById(characterId)
    if (!character) throw new Error(`Character ${characterId} not found`)

    return this.repo.addComment(characterId, content)
  }

  async softDelete(id: number): Promise<Character> {
    const updated = await this.repo.softDelete(id)
    await this.cache.invalidatePattern('characters:*')
    return updated
  }

  async syncFromApi(): Promise<void> {
    if (!this.rickMortyApi) throw new Error('Rick & Morty API adapter not configured')

    const apiCharacters = await this.rickMortyApi.fetchCharacters(1)
    const first15 = apiCharacters.slice(0, 15)

    await this.repo.upsertMany(
      first15.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        species: c.species,
        type: c.type || '',
        gender: c.gender,
        origin: c.origin.name,
        image: c.image,
      })),
    )

    await this.cache.invalidatePattern('characters:*')
    console.log('[CharacterUseCase] Synced 15 characters from Rick & Morty API')
  }
}
