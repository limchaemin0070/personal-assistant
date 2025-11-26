import { DataTypes, Model } from "sequelize";
import sequelize from "../config/database";
import { User } from "./User.model";

interface ScheduleAttributes {
  schedule_id?: number;
  user_id: number;
  title: string;
  memo?: string | null;
  start_date: Date;
  end_date: Date;
  start_time?: string | null;
  end_time?: string | null;
  is_all_day: boolean;
  notification_enabled: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class Schedule extends Model<ScheduleAttributes> implements ScheduleAttributes {
  public schedule_id!: number;
  public user_id!: number;
  public title!: string;
  public memo!: string | null;
  public start_date!: Date;
  public end_date!: Date;
  public start_time!: string | null;
  public end_time!: string | null;
  public is_all_day!: boolean;
  public notification_enabled!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Schedule.init(
  {
    schedule_id: {
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
    memo: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: [0, 500],
      },
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    start_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    end_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },
    is_all_day: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    notification_enabled: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: "Schedules",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["user_id"],
        name: "idx_schedules_user_id",
      },
      {
        fields: ["start_date"],
        name: "idx_schedules_start_date",
      },
      {
        fields: ["end_date"],
        name: "idx_schedules_end_date",
      },
    ],
  }
);

Schedule.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

export { Schedule };
