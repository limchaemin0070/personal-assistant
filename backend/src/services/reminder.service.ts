import { Reminder } from "../models/Reminder.model";
import { ReminderNotFoundError } from "../errors/BusinessError";

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

class ReminderService {
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
      notification_enabled: params.notification_enabled,
    });

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

    await reminder.destroy();

    return { message: "리마인더가 삭제되었습니다." };
  }
}

export const reminderService = new ReminderService();
