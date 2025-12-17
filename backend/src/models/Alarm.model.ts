import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User.model";

interface AlarmAttributes {
  alarm_id?: number;
  user_id: number;
  title?: string | null;
  date?: Date | null;
  time: string;
  is_repeat: boolean;
  repeat_days?: string | null;
  is_active: boolean;
  alarm_type: "repeat" | "once";
  next_trigger_at?: Date | null;
  last_triggered_at?: Date | null;
  trigger_count?: number;
  created_at?: Date;
  updated_at?: Date;
}

class Alarm extends Model<AlarmAttributes> implements AlarmAttributes {
  public alarm_id!: number;
  public user_id!: number;
  public title!: string | null;
  public date!: Date | null;
  public time!: string;
  public is_repeat!: boolean;
  public repeat_days!: string | null;
  public is_active!: boolean;
  public alarm_type!: "repeat" | "once";
  public next_trigger_at!: Date | null;
  public last_triggered_at!: Date | null;
  public trigger_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Alarm.init(
  {
    alarm_id: {
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
      allowNull: true,
      validate: {
        len: [0, 255],
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    time: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    is_repeat: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    repeat_days: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    alarm_type: {
      type: DataTypes.ENUM("repeat", "once"),
      allowNull: false,
    },
    next_trigger_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    last_triggered_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    trigger_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: "Alarms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_alarms_user_id",
      },
      {
        fields: ["is_active"],
        name: "idx_alarms_is_active",
      },
      {
        fields: ["next_trigger_at"],
        name: "idx_alarms_next_trigger_at",
      },
    ],
  }
);

Alarm.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export { Alarm };
