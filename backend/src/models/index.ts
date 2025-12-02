import { EmailVerification } from "./EmailVerification.model";
import { User } from "./User.model";
import { Schedule } from "./Schedule.model";
import { Reminder } from "./Reminder.model";
import { Alarm } from "./Alarm.model";

// User
User.hasMany(Schedule, {
  foreignKey: "user_id",
  as: "schedules",
});

User.hasMany(Reminder, {
  foreignKey: "user_id",
  as: "reminders",
});

User.hasMany(Alarm, {
  foreignKey: "user_id",
  as: "alarms",
});

// Schedule
Schedule.hasMany(Alarm, {
  foreignKey: "schedule_id",
  as: "alarms",
});

// Reminder
Reminder.hasMany(Alarm, {
  foreignKey: "reminder_id",
  as: "alarms",
});

export { EmailVerification, User, Schedule, Reminder, Alarm };
