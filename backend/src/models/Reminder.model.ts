import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User.model";

interface ReminderAttributes {
  reminder_id?: number;
  user_id: number;
  title: string;
  date?: Date | null;
  time?: string | null;
  memo?: string | null;
  is_all_day: boolean;
  is_completed: boolean;
  completed_at?: Date | null;
  notification_enabled: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class Reminder extends Model<ReminderAttributes> implements ReminderAttributes {
  public reminder_id!: number;
  public user_id!: number;
  public title!: string;
  public date!: Date | null;
  public time!: string | null;
  public memo!: string | null;
  public is_all_day!: boolean;
  public is_completed!: boolean;
  public completed_at!: Date | null;
  public notification_enabled!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Reminder.init(
  {
    reminder_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [1, 255],
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    memo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    is_all_day: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notification_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "Reminders",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_reminders_user_id",
      },
      {
        fields: ["date"],
        name: "idx_reminders_date",
      },
      {
        fields: ["is_completed"],
        name: "idx_reminders_is_completed",
      },
    ],
  }
);

Reminder.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export { Reminder };
