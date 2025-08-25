import { Model, DataTypes, Sequelize, Optional } from "sequelize";
import { sequelize } from "../lib/dbConfig";
import { v4 as uuidv4 } from "uuid";
import type { Models } from './index';

export interface LanguagesAttributes {
  language_id: string;
  name: string;
}

type LanguagesCreationAttributes = Optional<
  LanguagesAttributes,
  "language_id"
>;

export class Languages
  extends Model<LanguagesAttributes, LanguagesCreationAttributes>
  implements LanguagesAttributes
{
  public language_id!: string;
  public name!: string;

  static associate(models: Models) {
    // Add associations if needed
  }
}

Languages.init(
  {
    language_id: {
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
    tableName: "languages",
    timestamps: false,
  }
);

export default Languages;
