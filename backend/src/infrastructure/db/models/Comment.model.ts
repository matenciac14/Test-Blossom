import { DataTypes, Model, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import { sequelize } from './sequelize.instance'

interface CommentAttributes {
  id: string
  characterId: number
  content: string
  createdAt?: Date
  updatedAt?: Date
}

type CommentCreationAttributes = Optional<CommentAttributes, 'id'>

export class CommentModel
  extends Model<CommentAttributes, CommentCreationAttributes>
  implements CommentAttributes
{
  declare id: string
  declare characterId: number
  declare content: string
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

CommentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    characterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'characters', key: 'id' },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'comments',
  },
)
