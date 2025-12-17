import { Reminder } from "../models/Reminder.model";
import { ReminderNotFoundError } from "../errors/BusinessError";
import { reminderAlarmService } from "./reminder-alarm.service";

interface GetRemindersByUserIdResult {
  reminders: Reminder[];
}

interface CreateReminderParams {
  user_id: number;
  title: string;
  memo?: string | null;
  date?: Date | null;
  time?: string | null;
  is_all_day: boolean;
  notification_enabled: boolean;
}

interface CreateReminderResult {
  reminder: Reminder;
}

interface UpdateReminderParams {
  reminder_id: number;
  user_id: number;
  title?: string;
  memo?: string | null;
  date?: Date | null;
  time?: string | null;
  is_all_day?: boolean;
  is_completed?: boolean;
  notification_enabled?: boolean;
}

interface UpdateReminderResult {
  reminder: Reminder;
}

interface DeleteReminderResult {
  message: string;
}

interface UpdateReminderCompleteParams {
  reminder_id: number;
  user_id: number;
  is_completed: boolean;
}

interface UpdateReminderCompleteResult {
  reminder: Reminder;
}

class ReminderService {
  // 날짜를 YYYY-MM-DD 형식 문자열로 변환하는 헬퍼 함수
  private formatDateToString(date: Date | string | null): string | null {
    if (!date) return null;
    if (typeof date === "string") {
      // 이미 문자열인 경우 (YYYY-MM-DD 형식)
      return date;
    }
    // Date 객체인 경우
    return date.toISOString().split("T")[0] as string;
  }

  // 유저ID로 리마인더 목록 조회
  async getRemindersByUserId(
    userId: number
  ): Promise<GetRemindersByUserIdResult> {
    const reminders = await Reminder.findAll({
      where: { user_id: userId },
      order: [
        ["date", "ASC"],
        ["time", "ASC"],
      ],
    });

    return { reminders };
  }

  // 리마인더 생성
  async createReminder(
    params: CreateReminderParams
  ): Promise<CreateReminderResult> {
    const reminder = await Reminder.create({
      user_id: params.user_id,
      title: params.title,
      memo: params.memo ?? null,
      date: params.date ?? null,
      time: params.time ?? null,
      is_all_day: params.is_all_day,
      is_completed: false,
      notification_enabled: params.notification_enabled,
    });

    // 알림이 활성화되고 날짜와 시간이 있는 경우 리마인더 알람 생성
    if (
      params.notification_enabled &&
      params.date &&
      params.time &&
      !params.is_all_day
    ) {
      await reminderAlarmService.createReminderAlarm({
        user_id: params.user_id,
        reminder_id: reminder.reminder_id!,
        title: params.title,
        date: this.formatDateToString(params.date),
        time: params.time,
        is_active: true,
      });
    }

    return { reminder };
  }

  // 리마인더 ID와 유저 ID로 리마인더 조회 (권한 확인용)
  async findReminderByIdAndUserId(
    reminderId: number,
    userId: number
  ): Promise<Reminder | null> {
    const reminder = await Reminder.findOne({
      where: {
        reminder_id: reminderId,
        user_id: userId,
      },
    });

    return reminder;
  }

  // 리마인더 수정
  async updateReminder(
    params: UpdateReminderParams
  ): Promise<UpdateReminderResult> {
    const reminder = await this.findReminderByIdAndUserId(
      params.reminder_id,
      params.user_id
    );

    if (!reminder) {
      throw new ReminderNotFoundError();
    }

    // 기존 리마인더 알람 조회
    const existingReminderAlarm =
      await reminderAlarmService.findReminderAlarmByReminderId(
        params.reminder_id
      );

    // 업데이트할 필드만 설정
    const updateData: any = {};
    if (params.title !== undefined) updateData.title = params.title;
    if (params.memo !== undefined) updateData.memo = params.memo ?? null;
    if (params.date !== undefined) updateData.date = params.date ?? null;
    if (params.time !== undefined) updateData.time = params.time ?? null;
    if (params.is_all_day !== undefined)
      updateData.is_all_day = params.is_all_day;
    if (params.is_completed !== undefined) {
      updateData.is_completed = params.is_completed;
      // 완료 상태로 변경하는 경우 completed_at 설정
      if (params.is_completed === true) {
        updateData.completed_at = new Date();
      } else {
        updateData.completed_at = null;
      }
    }
    if (params.notification_enabled !== undefined)
      updateData.notification_enabled = params.notification_enabled;

    await reminder.update(updateData);

    // 알람 처리 로직
    const finalDate = params.date !== undefined ? params.date : reminder.date;
    const finalTime = params.time !== undefined ? params.time : reminder.time;
    const finalIsAllDay =
      params.is_all_day !== undefined ? params.is_all_day : reminder.is_all_day;
    const finalNotificationEnabled =
      params.notification_enabled !== undefined
        ? params.notification_enabled
        : reminder.notification_enabled;

    const shouldHaveAlarm =
      finalNotificationEnabled && finalDate && finalTime && !finalIsAllDay;

    if (shouldHaveAlarm) {
      // 리마인더 알람이 있어야 하는 경우
      if (existingReminderAlarm) {
        // 기존 리마인더 알람 업데이트
        await reminderAlarmService.updateReminderAlarm({
          reminder_alarm_id: existingReminderAlarm.reminder_alarm_id,
          user_id: params.user_id,
          title: params.title !== undefined ? params.title : reminder.title,
          date: this.formatDateToString(finalDate),
          time: finalTime!,
          is_active: true,
        });
      } else {
        // 새 리마인더 알람 생성
        await reminderAlarmService.createReminderAlarm({
          user_id: params.user_id,
          reminder_id: params.reminder_id,
          title: params.title !== undefined ? params.title : reminder.title,
          date: this.formatDateToString(finalDate),
          time: finalTime!,
          is_active: true,
        });
      }
    } else {
      // 리마인더 알람이 없어야 하는 경우 - 기존 리마인더 알람 삭제
      if (existingReminderAlarm) {
        await reminderAlarmService.deleteReminderAlarm(
          existingReminderAlarm.reminder_alarm_id,
          params.user_id
        );
      }
    }

    return { reminder };
  }

  // 리마인더 완료 상태만 업데이트
  async updateReminderComplete(
    params: UpdateReminderCompleteParams
  ): Promise<UpdateReminderCompleteResult> {
    const reminder = await this.findReminderByIdAndUserId(
      params.reminder_id,
      params.user_id
    );

    if (!reminder) {
      throw new ReminderNotFoundError();
    }

    // 완료 상태와 completed_at 업데이트
    const updateData: any = {
      is_completed: params.is_completed,
    };

    if (params.is_completed === true) {
      updateData.completed_at = new Date();
    } else {
      updateData.completed_at = null;
    }

    await reminder.update(updateData);

    return { reminder };
  }

  // 리마인더 삭제
  async deleteReminder(
    reminderId: number,
    userId: number
  ): Promise<DeleteReminderResult> {
    const reminder = await this.findReminderByIdAndUserId(reminderId, userId);

    if (!reminder) {
      throw new ReminderNotFoundError();
    }

    // 연결된 리마인더 알람 삭제
    await reminderAlarmService.deleteReminderAlarmByReminderId(reminderId);

    await reminder.destroy();

    return { message: "리마인더가 삭제되었습니다." };
  }
}

export const reminderService = new ReminderService();
