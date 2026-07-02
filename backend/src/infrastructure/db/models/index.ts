export { sequelize } from './sequelize.instance'
export { CharacterModel } from './Character.model'
export { CommentModel } from './Comment.model'

import { CharacterModel } from './Character.model'
import { CommentModel } from './Comment.model'
import { sequelize } from './sequelize.instance'

// Associations
CharacterModel.hasMany(CommentModel, { foreignKey: 'characterId', as: 'comments' })
CommentModel.belongsTo(CharacterModel, { foreignKey: 'characterId' })

export async function initDatabase(): Promise<void> {
  await sequelize.authenticate()
  console.log('[DB] Connection established successfully')
}
