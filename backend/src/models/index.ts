import { EmailVerification } from "./EmailVerification.model";
import { User } from "./User.model";
import { Schedule } from "./Schedule.model";
import { Reminder } from "./Reminder.model";
import { Alarm } from "./Alarm.model";
import { ReminderAlarm } from "./ReminderAlarm.model";

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

User.hasMany(ReminderAlarm, {
  foreignKey: "user_id",
  as: "reminderAlarms",
});

// Reminder
Reminder.hasMany(ReminderAlarm, {
  foreignKey: "reminder_id",
  as: "reminderAlarms",
});

export { EmailVerification, User, Schedule, Reminder, Alarm, ReminderAlarm };
