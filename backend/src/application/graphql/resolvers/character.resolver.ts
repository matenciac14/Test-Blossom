import { CharacterUseCase } from '../../../domain/character/character.use-case'
import { CharacterFilters } from '../../../domain/character/character.types'
import { Timing } from '../../decorators/timing.decorator'

export class CharacterResolver {
  constructor(private readonly useCase: CharacterUseCase) {}

  @Timing
  async characters(_: unknown, args: { filters?: CharacterFilters }) {
    return this.useCase.findAll(args.filters ?? {})
  }

  @Timing
  async character(_: unknown, args: { id: number }) {
    return this.useCase.findById(args.id)
  }

  async toggleFavorite(_: unknown, args: { id: number }) {
    return this.useCase.toggleFavorite(args.id)
  }

  async addComment(_: unknown, args: { characterId: number; content: string }) {
    return this.useCase.addComment(args.characterId, args.content)
  }

  async softDeleteCharacter(_: unknown, args: { id: number }) {
    return this.useCase.softDelete(args.id)
  }
}
