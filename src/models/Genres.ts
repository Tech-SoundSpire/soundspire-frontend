import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";
import type { Models } from './index';

export interface GenresAttributes {
  genre_id: string;
  name: string;
}

type GenresCreationAttributes = Optional<
  GenresAttributes,
  "genre_id"
>;

export class Genres
  extends Model<GenresAttributes, GenresCreationAttributes>
  implements GenresAttributes
{
  public genre_id!: string;
  public name!: string;

  static associate(models: Models) {
    // Add associations if needed
  }
}

Genres.init(
  {
    genre_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: () => uuidv4(),
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: "genres",
    timestamps: false,
  }
);

export default Genres;
