import { ReminderAlarm } from "../models/ReminderAlarm.model";
import { ReminderAlarmNotFoundError } from "../errors/BusinessError";
import { alarmSchedulerService } from "./notification/alarm-scheduler.service";
import { AlarmType } from "../types/notification";
import { AlarmHandlerFactory } from "./notification/handler/alarm-handler.factory";

interface CreateReminderAlarmParams {
  user_id: number;
  reminder_id: number;
  title?: string | null;
  date?: string | Date | null;
  time: string;
  is_active: boolean;
  next_trigger_at?: Date | null;
  last_triggered_at?: Date | null;
  trigger_count?: number;
}

interface CreateReminderAlarmResult {
  reminderAlarm: ReminderAlarm;
}

interface UpdateReminderAlarmParams {
  reminder_alarm_id: number;
  user_id: number;
  title?: string;
  date?: string | Date | null;
  time?: string;
  is_active?: boolean;
  next_trigger_at?: Date | null;
  last_triggered_at?: Date | null;
  trigger_count?: number;
}

interface UpdateReminderAlarmResult {
  reminderAlarm: ReminderAlarm;
}

interface DeleteReminderAlarmResult {
  message: string;
}

class ReminderAlarmService {
  // reminder_id로 리마인더 알람 조회
  async findReminderAlarmByReminderId(
    reminderId: number
  ): Promise<ReminderAlarm | null> {
    const reminderAlarm = await ReminderAlarm.findOne({
      where: {
        reminder_id: reminderId,
      },
    });

    return reminderAlarm;
  }

  // 리마인더 알람 생성 (리마인더 서비스에서만 호출)
  async createReminderAlarm(
    params: CreateReminderAlarmParams
  ): Promise<CreateReminderAlarmResult> {
    const reminderAlarm = await ReminderAlarm.create({
      user_id: params.user_id,
      reminder_id: params.reminder_id,
      title: params.title ?? null,
      date: params.date ? new Date(params.date) : null,
      time: params.time,
      is_active: params.is_active,
      next_trigger_at: params.next_trigger_at ?? null,
      last_triggered_at: params.last_triggered_at ?? null,
      trigger_count: params.trigger_count ?? 0,
    });

    // 활성 알람 스케줄링
    if (reminderAlarm.is_active) {
      try {
        await this.scheduleReminderAlarm(reminderAlarm);
      } catch (error) {
        console.error("Scheduler failed:", error);
      }
    }

    return { reminderAlarm };
  }

  // 리마인더 알람 수정 (리마인더 서비스에서만 호출)
  async updateReminderAlarm(
    params: UpdateReminderAlarmParams
  ): Promise<UpdateReminderAlarmResult> {
    const reminderAlarm = await ReminderAlarm.findOne({
      where: {
        reminder_alarm_id: params.reminder_alarm_id,
        user_id: params.user_id,
      },
    });

    if (!reminderAlarm) {
      throw new ReminderAlarmNotFoundError();
    }

    // 업데이트할 필드만 설정
    const updateData: any = {};
    if (params.title !== undefined) {
      updateData.title = params.title ?? null;
    }
    if (params.date !== undefined) {
      updateData.date = params.date ? new Date(params.date) : null;
    }
    if (params.time !== undefined) {
      updateData.time = params.time;
    }
    if (params.is_active !== undefined) {
      updateData.is_active = params.is_active;
    }
    if (params.next_trigger_at !== undefined) {
      updateData.next_trigger_at = params.next_trigger_at;
    }
    if (params.last_triggered_at !== undefined) {
      updateData.last_triggered_at = params.last_triggered_at;
    }
    if (params.trigger_count !== undefined) {
      updateData.trigger_count = params.trigger_count;
    }

    await reminderAlarm.update(updateData);

    // 기존 알람 정리
    await alarmSchedulerService.cancelAlarm(
      reminderAlarm.reminder_alarm_id!,
      AlarmType.REMINDER_ALARM
    );
    if (reminderAlarm.is_active) {
      await this.scheduleReminderAlarm(reminderAlarm);
    }

    return { reminderAlarm };
  }

  // 리마인더 알람 삭제
  async deleteReminderAlarm(
    reminderAlarmId: number,
    userId: number
  ): Promise<DeleteReminderAlarmResult> {
    const reminderAlarm = await ReminderAlarm.findOne({
      where: {
        reminder_alarm_id: reminderAlarmId,
        user_id: userId,
      },
    });

    if (!reminderAlarm) {
      throw new ReminderAlarmNotFoundError();
    }

    await alarmSchedulerService.cancelAlarm(
      reminderAlarm.reminder_alarm_id!,
      AlarmType.REMINDER_ALARM
    );

    await reminderAlarm.destroy();

    return { message: "리마인더 알람이 삭제되었습니다." };
  }

  // reminder_id로 리마인더 알람 삭제
  async deleteReminderAlarmByReminderId(
    reminderId: number
  ): Promise<DeleteReminderAlarmResult> {
    const reminderAlarm = await this.findReminderAlarmByReminderId(reminderId);

    if (reminderAlarm) {
      // 스케줄러에서 알람 취소
      await alarmSchedulerService.cancelAlarm(
        reminderAlarm.reminder_alarm_id!,
        AlarmType.REMINDER_ALARM
      );
      await reminderAlarm.destroy();
    }

    return { message: "리마인더 알람이 삭제되었습니다." };
  }

  /**
   * 리마인더 알람 스케줄링
   * 리마인더 알람 생성/수정 시 초기 스케줄링을 담당
   */
  private async scheduleReminderAlarm(
    reminderAlarm: ReminderAlarm
  ): Promise<void> {
    const handler = AlarmHandlerFactory.getHandlerByAlarm(reminderAlarm);

    // 트리거 가능 여부 검증
    if (!handler.canTrigger(reminderAlarm)) {
      return;
    }

    // 다음 트리거 시간 계산
    const nextTriggerTime = handler.calculateNextTriggerTime(
      reminderAlarm,
      new Date()
    );

    // 시간 계산 실패 시 종료
    if (!nextTriggerTime) {
      return;
    }

    // MySQL에 다음 실행 시간 저장
    await reminderAlarm.update({ next_trigger_at: nextTriggerTime });

    // BullMQ에 스케줄 등록 (알람 객체를 전달하면 내부에서 핸들러를 사용하여 처리)
    await alarmSchedulerService.scheduleAlarm(reminderAlarm);
  }
}

export const reminderAlarmService = new ReminderAlarmService();
