import { Op, WhereOptions } from 'sequelize'
import { ICharacterRepository } from '../../domain/ports/character.repository.port'
import { Character, Comment } from '../../domain/character/character.entity'
import { CharacterFilters } from '../../domain/character/character.types'
import { CharacterModel } from './models/Character.model'
import { CommentModel } from './models/Comment.model'

export class CharacterRepository implements ICharacterRepository {
  async findAll(filters: CharacterFilters): Promise<Character[]> {
    const where: WhereOptions = {}

    if (filters.name) where['name'] = { [Op.iLike]: `%${filters.name}%` }
    if (filters.status) where['status'] = filters.status
    if (filters.species) where['species'] = filters.species
    if (filters.gender) where['gender'] = filters.gender
    if (filters.origin) where['origin'] = { [Op.iLike]: `%${filters.origin}%` }
    if (filters.onlyFavorites) where['isFavorite'] = true
    if (filters.onlyNonFavorites) where['isFavorite'] = false

    const order: [string, string][] =
      filters.sortBy === 'name_desc' ? [['name', 'DESC']] : [['name', 'ASC']]

    const models = await CharacterModel.findAll({
      where,
      order,
      paranoid: !filters.includeDeleted,
      include: [{ model: CommentModel, as: 'comments' }],
    })

    return models.map(this.toEntity)
  }

  async findById(id: number): Promise<Character | null> {
    const model = await CharacterModel.findByPk(id, {
      paranoid: false,
      include: [{ model: CommentModel, as: 'comments' }],
    })
    return model ? this.toEntity(model) : null
  }

  async update(id: number, data: Partial<Character>): Promise<Character> {
    await CharacterModel.update(data as Partial<CharacterModel>, { where: { id } })
    const updated = await this.findById(id)
    if (!updated) throw new Error(`Character ${id} not found after update`)
    return updated
  }

  async addComment(characterId: number, content: string): Promise<Comment> {
    const model = await CommentModel.create({ characterId, content })
    return {
      id: model.id,
      characterId: model.characterId,
      content: model.content,
      createdAt: model.createdAt,
    }
  }

  async softDelete(id: number): Promise<Character> {
    await CharacterModel.destroy({ where: { id } })
    const updated = await this.findById(id)
    if (!updated) throw new Error(`Character ${id} not found after soft delete`)
    return updated
  }

  async upsertMany(characters: Partial<Character>[]): Promise<void> {
    await Promise.all(characters.map((c) => CharacterModel.upsert(c as unknown as CharacterModel)))
  }

  private toEntity(model: CharacterModel): Character {
    const plain = model.get({ plain: true }) as unknown as Record<string, unknown>
    const comments = (plain['comments'] as Record<string, unknown>[] | undefined) ?? []

    return {
      id: plain['id'] as number,
      name: plain['name'] as string,
      status: plain['status'] as string,
      species: plain['species'] as string,
      type: (plain['type'] as string) || '',
      gender: plain['gender'] as string,
      origin: plain['origin'] as string,
      image: plain['image'] as string,
      isFavorite: plain['isFavorite'] as boolean,
      deletedAt: (plain['deletedAt'] as Date | null) ?? null,
      comments: comments.map((c) => ({
        id: c['id'] as string,
        characterId: c['characterId'] as number,
        content: c['content'] as string,
        createdAt: c['createdAt'] as Date,
      })),
      createdAt: plain['createdAt'] as Date,
      updatedAt: plain['updatedAt'] as Date,
    }
  }
}
