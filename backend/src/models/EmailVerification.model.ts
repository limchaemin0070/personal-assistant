import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/database";

interface EmailVerificationAttributes {
  id?: number;
  email: string;
  code: string;
  expires_at: Date;
  is_verified: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class EmailVerification
  extends Model<EmailVerificationAttributes>
  implements EmailVerificationAttributes
{
  public id!: number;
  public email!: string;
  public code!: string;
  public expires_at!: Date;
  public is_verified!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

EmailVerification.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    code: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "email_verifications",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["expires_at"],
      },
      {
        fields: ["email", "is_verified"],
      },
    ],
  }
);

export { EmailVerification };
