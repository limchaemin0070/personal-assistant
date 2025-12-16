import { Alarm } from "../models/Alarm.model";
import { AlarmNotFoundError } from "../errors/BusinessError";
import { alarmSchedulerService } from "./notification/alarm-scheduler.service";
import { alarmTriggerService } from "./notification/alarm-trigger.service";

interface GetAlarmsByUserIdResult {
  alarms: Alarm[];
}

interface CreateAlarmParams {
  user_id: number;
  schedule_id?: number | null;
  reminder_id?: number | null;
  title?: string | null;
  date?: string | Date | null;
  time: string;
  is_repeat: boolean;
  repeat_days?: number[] | null;
  is_active: boolean;
  alarm_type: "basic" | "event";
  next_trigger_at?: Date | null;
  last_triggered_at?: Date | null;
  trigger_count?: number;
}

interface CreateAlarmResult {
  alarm: Alarm;
}

interface UpdateAlarmParams {
  alarm_id: number;
  user_id: number;
  schedule_id?: number | null;
  reminder_id?: number | null;
  title?: string;
  date?: string | Date | null;
  time?: string;
  is_repeat?: boolean;
  repeat_days?: number[] | null;
  is_active?: boolean;
  alarm_type?: "basic" | "event";
  next_trigger_at?: Date | null;
  last_triggered_at?: Date | null;
  trigger_count?: number;
}

interface UpdateAlarmResult {
  alarm: Alarm;
}

interface DeleteAlarmResult {
  message: string;
}

interface UpdateAlarmActiveParams {
  alarm_id: number;
  user_id: number;
  is_active: boolean;
}

interface UpdateAlarmActiveResult {
  alarm: Alarm;
}

class AlarmService {
  // 유저ID로 알람 목록 조회
  async getAlarmsByUserId(userId: number): Promise<GetAlarmsByUserIdResult> {
    const alarms = await Alarm.findAll({
      where: { user_id: userId },
      order: [["time", "ASC"]],
    });

    return { alarms };
  }

  // 알람 생성
  async createAlarm(params: CreateAlarmParams): Promise<CreateAlarmResult> {
    const alarm = await Alarm.create({
      user_id: params.user_id,
      schedule_id: params.schedule_id ?? null,
      reminder_id: params.reminder_id ?? null,
      title: params.title ?? null,
      date: params.date ? new Date(params.date) : null,
      time: params.time,
      is_repeat: params.is_repeat,
      repeat_days: params.repeat_days
        ? JSON.stringify(params.repeat_days)
        : null,
      is_active: params.is_active,
      alarm_type: params.alarm_type,
      next_trigger_at: params.next_trigger_at ?? null,
      last_triggered_at: params.last_triggered_at ?? null,
      trigger_count: params.trigger_count ?? 0,
    });

    // 활성 알람 스케줄링
    if (alarm.is_active) {
      try {
        await this.scheduleAlarm(alarm);
      } catch (error) {
        console.error("Scheduler failed:", error);
      }
    }

    return { alarm };
  }

  // 알람 ID와 유저 ID로 알람 조회 (권한 확인용)
  async findAlarmByIdAndUserId(
    alarmId: number,
    userId: number
  ): Promise<Alarm | null> {
    const alarm = await Alarm.findOne({
      where: {
        alarm_id: alarmId,
        user_id: userId,
      },
    });

    return alarm;
  }

  // 알람 수정
  async updateAlarm(params: UpdateAlarmParams): Promise<UpdateAlarmResult> {
    const alarm = await this.findAlarmByIdAndUserId(
      params.alarm_id,
      params.user_id
    );

    if (!alarm) {
      throw new AlarmNotFoundError();
    }

    // 업데이트할 필드만 설정
    const updateData: any = {};
    if (params.schedule_id !== undefined) {
      updateData.schedule_id = params.schedule_id ?? null;
    }
    if (params.reminder_id !== undefined) {
      updateData.reminder_id = params.reminder_id ?? null;
    }
    if (params.title !== undefined) {
      updateData.title = params.title ?? null;
    }
    if (params.date !== undefined) {
      updateData.date = params.date ? new Date(params.date) : null;
    }
    if (params.time !== undefined) {
      updateData.time = params.time;
    }
    if (params.is_repeat !== undefined) {
      updateData.is_repeat = params.is_repeat;
    }
    if (params.repeat_days !== undefined) {
      updateData.repeat_days = params.repeat_days
        ? JSON.stringify(params.repeat_days)
        : null;
    }
    if (params.is_active !== undefined) {
      updateData.is_active = params.is_active;
    }
    if (params.alarm_type !== undefined) {
      updateData.alarm_type = params.alarm_type;
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

    await alarm.update(updateData);

    // 기존 알람 정리
    await alarmSchedulerService.cancelAlarm(alarm.alarm_id!);
    if (alarm.is_active) {
      await this.scheduleAlarm(alarm);
    }

    return { alarm };
  }

  // 알람 활성 상태만 업데이트
  async updateAlarmActive(
    params: UpdateAlarmActiveParams
  ): Promise<UpdateAlarmActiveResult> {
    const alarm = await this.findAlarmByIdAndUserId(
      params.alarm_id,
      params.user_id
    );

    if (!alarm) {
      throw new AlarmNotFoundError();
    }

    await alarm.update({
      is_active: params.is_active,
    });

    if (!alarm.is_active) {
      // 비활성화 시 스케줄 제거
      await alarmSchedulerService.cancelAlarm(alarm.alarm_id!);
    } else {
      // 다시 활성화 시 재스케줄
      await this.scheduleAlarm(alarm);
    }

    return { alarm };
  }

  // 알람 삭제
  async deleteAlarm(
    alarmId: number,
    userId: number
  ): Promise<DeleteAlarmResult> {
    const alarm = await this.findAlarmByIdAndUserId(alarmId, userId);

    if (!alarm) {
      throw new AlarmNotFoundError();
    }

    await alarmSchedulerService.cancelAlarm(alarm.alarm_id!);

    await alarm.destroy();

    return { message: "알람이 삭제되었습니다." };
  }

  /**
   * 알람 스케줄링 (내부 헬퍼 메서드)
   * 알람 생성/수정 시 초기 스케줄링을 담당
   */
  private async scheduleAlarm(alarm: Alarm): Promise<void> {
    // 트리거 가능 여부 검증
    if (!alarmTriggerService.canTrigger(alarm)) {
      return;
    }

    // 다음 트리거 시간 계산 (AlarmTriggerService 재사용)
    const nextTriggerTime = alarmTriggerService.calculateNextTriggerTime(
      alarm,
      new Date()
    );

    // 시간 계산 실패 시 종료
    if (!nextTriggerTime) {
      return;
    }

    // BullMQ에 스케줄 등록
    await alarmSchedulerService.scheduleAlarmAt(
      alarm.alarm_id,
      nextTriggerTime
    );

    // MySQL에 다음 실행 시간 저장
    await alarm.update({ next_trigger_at: nextTriggerTime });
  }

  // reminder_id로 알람 조회
  async findAlarmByReminderId(reminderId: number): Promise<Alarm | null> {
    const alarm = await Alarm.findOne({
      where: {
        reminder_id: reminderId,
      },
    });

    return alarm;
  }

  // reminder_id로 알람 삭제
  async deleteAlarmByReminderId(
    reminderId: number
  ): Promise<DeleteAlarmResult> {
    const alarm = await this.findAlarmByReminderId(reminderId);

    if (alarm) {
      await alarm.destroy();
    }

    return { message: "알람이 삭제되었습니다." };
  }
}

export const alarmService = new AlarmService();
