// backend/src/services/notification/handlers/alarm-handler.factory.ts

import { AlarmHandler } from "./alarm-handler.interface";
import { BasicAlarmHandler } from "./basic-alarm.handler";
import { ReminderAlarmHandler } from "./reminder-alarm.handler";
import { Alarm } from "../../../models/Alarm.model";
import { ReminderAlarm } from "../../../models/ReminderAlarm.model";
import { AlarmType } from "../../../types/notification";

/**
 * 알람 핸들러 팩토리 - 싱글톤 패턴
 */
export class AlarmHandlerFactory {
  private static handlers = new Map<string, AlarmHandler<any>>();
  private static initialized = false;

  // 초기화
  private static initialize(): void {
    if (this.initialized) return;

    this.registerHandler(new BasicAlarmHandler());
    this.registerHandler(new ReminderAlarmHandler());

    this.initialized = true;
  }

  // 핸들러 등록
  private static registerHandler<T>(handler: AlarmHandler<T>): void {
    if (this.handlers.has(handler.alarmType)) {
      console.warn(`Handler already registered: ${handler.alarmType}`);
      return;
    }
    this.handlers.set(handler.alarmType, handler);
  }

  // 타입으로 핸들러 가져오기
  static getHandler<T>(alarmType: string): AlarmHandler<T> {
    this.initialize();

    const handler = this.handlers.get(alarmType);
    if (!handler) {
      throw new Error(
        `Handler not found: ${alarmType}. Available: ${Array.from(
          this.handlers.keys()
        ).join(", ")}`
      );
    }
    return handler as AlarmHandler<T>;
  }

  // 알람 객체에서 핸들러 가져오기
  static getHandlerByAlarm(
    alarm: Alarm | ReminderAlarm
  ): AlarmHandler<Alarm | ReminderAlarm> {
    this.initialize();

    if (alarm instanceof ReminderAlarm) {
      return this.getHandler<ReminderAlarm>(AlarmType.REMINDER_ALARM);
    }
    if (alarm instanceof Alarm) {
      return this.getHandler<Alarm>(AlarmType.ALARM);
    }

    // 이부분의 역할이 뭐지
    // if ("alarmType" in alarm && typeof alarm.alarmType === "string") {
    //   return this.getHandler(alarm.alarmType);
    // }

    throw new Error("Unknown alarm type");
  }

  static async getHandlerAndLoadAlarm(
    alarmId: number,
    alarmType: string
  ): Promise<{ handler: AlarmHandler<any>; alarm: any } | null> {
    this.initialize();

    const handler = this.getHandler(alarmType);
    const alarm = await handler.findById(alarmId);

    if (!alarm) {
      return null;
    }

    return { handler, alarm };
  }

  //   static getAvailableTypes(): string[] {
  //     this.initialize();
  //     return Array.from(this.handlers.keys());
  //   }

  //   static hasHandler(alarmType: string): boolean {
  //     this.initialize();
  //     return this.handlers.has(alarmType);
  //   }

  static reset(): void {
    this.handlers.clear();
    this.initialized = false;
  }
}
