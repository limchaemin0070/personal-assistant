import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User.model";
import { Schedule } from "./Schedule.model";
import { Reminder } from "./Reminder.model";

interface AlarmAttributes {
  alarm_id?: number;
  user_id: number;
  schedule_id?: number | null;
  reminder_id?: number | null;
  title?: string | null;
  date?: Date | null;
  time: string;
  is_repeat: boolean;
  repeat_days?: string | null;
  is_active: boolean;
  //   알람 타입
  //   1. 베이직 - 월 수 금 반복 알람 등 이벤트와 무관
  //   2. 이벤트 - 특정 이벤트나 일정 등에 부착하여 실행되는 일회성 알람
  alarm_type: "basic" | "event";
  created_at?: Date;
  updated_at?: Date;
}

class Alarm extends Model<AlarmAttributes> implements AlarmAttributes {
  public alarm_id!: number;
  public user_id!: number;
  public schedule_id!: number | null;
  public reminder_id!: number | null;
  public title!: string | null;
  public date!: Date | null;
  public time!: string;
  public is_repeat!: boolean;
  public repeat_days!: string | null;
  public is_active!: boolean;
  public alarm_type!: "basic" | "event";
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
    schedule_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: "Schedules",
        key: "schedule_id",
      },
    },
    reminder_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
      type: DataTypes.ENUM("basic", "event"),
      allowNull: false,
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
        fields: ["schedule_id"],
        name: "idx_alarms_schedule_id",
      },
      {
        fields: ["reminder_id"],
        name: "idx_alarms_reminder_id",
      },
      {
        fields: ["is_active"],
        name: "idx_alarms_is_active",
      },
    ],
  }
);

Alarm.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

Alarm.belongsTo(Schedule, {
  foreignKey: "schedule_id",
  as: "schedule",
});

Alarm.belongsTo(Reminder, {
  foreignKey: "reminder_id",
  as: "reminder",
});

export { Alarm };
