import { DataTypes, Model, Sequelize } from "sequelize";
import sequelize from "../config/database";

interface EmailVerificationAttributes {
  id?: number;
  email: string;
  code: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

class EmailVerification
  extends Model<EmailVerificationAttributes>
  implements EmailVerificationAttributes
{
  public id!: number;
  public email!: string;
  public code!: string;
  public expiresAt!: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
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
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "email_verifications",
    timestamps: true,
    indexes: [
      {
        fields: ["email"],
      },
      {
        fields: ["expiresAt"],
      },
    ],
  }
);

export { EmailVerification };
