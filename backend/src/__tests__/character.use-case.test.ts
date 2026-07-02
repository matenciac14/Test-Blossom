import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CharacterUseCase } from '../domain/character/character.use-case'
import { ICharacterRepository } from '../domain/ports/character.repository.port'
import { ICachePort } from '../domain/ports/cache.port'
import { Character, Comment } from '../domain/character/character.entity'

const mockDate = new Date('2024-01-01')

const mockCharacter: Character = {
  id: 1,
  name: 'Rick Sanchez',
  status: 'Alive',
  species: 'Human',
  type: '',
  gender: 'Male',
  origin: 'Earth (C-137)',
  image: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
  isFavorite: false,
  deletedAt: null,
  comments: [],
  createdAt: mockDate,
  updatedAt: mockDate,
}

const mockComment: Comment = {
  id: 'uuid-1',
  characterId: 1,
  content: 'Great character!',
  createdAt: mockDate,
}

describe('CharacterUseCase', () => {
  let repo: ICharacterRepository
  let cache: ICachePort
  let useCase: CharacterUseCase

  beforeEach(() => {
    repo = {
      findAll: vi.fn().mockResolvedValue([mockCharacter]),
      findById: vi.fn().mockResolvedValue(mockCharacter),
      update: vi.fn().mockResolvedValue({ ...mockCharacter, isFavorite: true }),
      addComment: vi.fn().mockResolvedValue(mockComment),
      softDelete: vi.fn().mockResolvedValue({ ...mockCharacter, deletedAt: mockDate }),
      upsertMany: vi.fn().mockResolvedValue(undefined),
    }

    cache = {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
      del: vi.fn().mockResolvedValue(undefined),
      invalidatePattern: vi.fn().mockResolvedValue(undefined),
    }

    useCase = new CharacterUseCase(repo, cache)
  })

  describe('findAll', () => {
    it('returns characters from DB and caches result when cache is empty', async () => {
      const result = await useCase.findAll({})

      expect(cache.get).toHaveBeenCalledWith('characters:{}')
      expect(repo.findAll).toHaveBeenCalledWith({})
      expect(cache.set).toHaveBeenCalledWith('characters:{}', [mockCharacter], 300)
      expect(result).toEqual([mockCharacter])
    })

    it('returns cached characters without hitting DB', async () => {
      cache.get = vi.fn().mockResolvedValue([mockCharacter])

      const result = await useCase.findAll({})

      expect(cache.get).toHaveBeenCalled()
      expect(repo.findAll).not.toHaveBeenCalled()
      expect(result).toEqual([mockCharacter])
    })

    it('passes filters to repository', async () => {
      await useCase.findAll({ status: 'Alive', species: 'Human' })

      expect(repo.findAll).toHaveBeenCalledWith({ status: 'Alive', species: 'Human' })
    })
  })

  describe('toggleFavorite', () => {
    it('toggles isFavorite to true and invalidates cache', async () => {
      const result = await useCase.toggleFavorite(1)

      expect(repo.findById).toHaveBeenCalledWith(1)
      expect(repo.update).toHaveBeenCalledWith(1, { isFavorite: true })
      expect(cache.invalidatePattern).toHaveBeenCalledWith('characters:*')
      expect(result.isFavorite).toBe(true)
    })

    it('throws when character is not found', async () => {
      repo.findById = vi.fn().mockResolvedValue(null)

      await expect(useCase.toggleFavorite(999)).rejects.toThrow('Character 999 not found')
    })
  })

  describe('addComment', () => {
    it('creates a comment for an existing character', async () => {
      const result = await useCase.addComment(1, 'Great character!')

      expect(repo.findById).toHaveBeenCalledWith(1)
      expect(repo.addComment).toHaveBeenCalledWith(1, 'Great character!')
      expect(result).toEqual(mockComment)
    })

    it('throws when character is not found', async () => {
      repo.findById = vi.fn().mockResolvedValue(null)

      await expect(useCase.addComment(999, 'test')).rejects.toThrow('Character 999 not found')
    })
  })

  describe('softDelete', () => {
    it('soft deletes a character and invalidates cache', async () => {
      const result = await useCase.softDelete(1)

      expect(repo.softDelete).toHaveBeenCalledWith(1)
      expect(cache.invalidatePattern).toHaveBeenCalledWith('characters:*')
      expect(result.deletedAt).toBe(mockDate)
    })
  })
})
