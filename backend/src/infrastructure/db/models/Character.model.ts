import { DataTypes, Model, Optional } from 'sequelize'
import { sequelize } from './sequelize.instance'

interface CharacterAttributes {
  id: number
  name: string
  status: string
  species: string
  type: string
  gender: string
  origin: string
  image: string
  isFavorite: boolean
  createdAt?: Date
  updatedAt?: Date
  deletedAt?: Date | null
}

type CharacterCreationAttributes = Optional<CharacterAttributes, 'isFavorite' | 'deletedAt'>

export class CharacterModel
  extends Model<CharacterAttributes, CharacterCreationAttributes>
  implements CharacterAttributes
{
  declare id: number
  declare name: string
  declare status: string
  declare species: string
  declare type: string
  declare gender: string
  declare origin: string
  declare image: string
  declare isFavorite: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
  declare readonly deletedAt: Date | null
}

CharacterModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, allowNull: false },
    name: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.STRING, allowNull: false },
    species: { type: DataTypes.STRING, allowNull: false },
    type: { type: DataTypes.STRING, defaultValue: '' },
    gender: { type: DataTypes.STRING, allowNull: false },
    origin: { type: DataTypes.STRING, allowNull: false },
    image: { type: DataTypes.STRING, allowNull: false },
    isFavorite: { type: DataTypes.BOOLEAN, defaultValue: false, allowNull: false },
  },
  {
    sequelize,
    tableName: 'characters',
    paranoid: true,    // enables soft-delete via deletedAt
    deletedAt: 'deletedAt',
  },
)
