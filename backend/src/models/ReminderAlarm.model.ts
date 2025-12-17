import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User.model";
import { Reminder } from "./Reminder.model";

interface ReminderAlarmAttributes {
  reminder_alarm_id?: number;
  user_id: number;
  reminder_id: number;
  title?: string | null;
  date?: Date | null;
  time: string;
  is_active: boolean;
  next_trigger_at?: Date | null;
  last_triggered_at?: Date | null;
  trigger_count?: number;
  created_at?: Date;
  updated_at?: Date;
}

class ReminderAlarm
  extends Model<ReminderAlarmAttributes>
  implements ReminderAlarmAttributes
{
  public reminder_alarm_id!: number;
  public user_id!: number;
  public reminder_id!: number;
  public title!: string | null;
  public date!: Date | null;
  public time!: string;
  public is_active!: boolean;
  public next_trigger_at!: Date | null;
  public last_triggered_at!: Date | null;
  public trigger_count!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

ReminderAlarm.init(
  {
    reminder_alarm_id: {
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
    reminder_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Reminders",
        key: "reminder_id",
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
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: "ReminderAlarms",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_reminder_alarms_user_id",
      },
      {
        fields: ["reminder_id"],
        name: "idx_reminder_alarms_reminder_id",
      },
      {
        fields: ["is_active"],
        name: "idx_reminder_alarms_is_active",
      },
      {
        fields: ["next_trigger_at"],
        name: "idx_reminder_alarms_next_trigger_at",
      },
    ],
  }
);

ReminderAlarm.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

ReminderAlarm.belongsTo(Reminder, {
  foreignKey: "reminder_id",
  as: "reminder",
});

export { ReminderAlarm };
