import { Op } from "sequelize";
import { Schedule } from "../models/Schedule.model";
import { ScheduleNotFoundError } from "../errors/BusinessError";

interface GetSchedulesByUserIdResult {
  schedules: Schedule[];
}

interface CreateScheduleParams {
  user_id: number;
  title: string;
  memo?: string | null;
  start_date: Date;
  end_date: Date;
  start_time?: string | null;
  end_time?: string | null;
  is_all_day: boolean;
  notification_enabled: boolean;
}

interface CreateScheduleResult {
  schedule: Schedule;
}

interface UpdateScheduleParams {
  schedule_id: number;
  user_id: number;
  title?: string;
  memo?: string | null;
  start_date?: Date;
  end_date?: Date;
  start_time?: string | null;
  end_time?: string | null;
  is_all_day?: boolean;
  notification_enabled?: boolean;
}

interface UpdateScheduleResult {
  schedule: Schedule;
}

interface DeleteScheduleResult {
  message: string;
}

interface GetSchedulesByDateRangeParams {
  userId: number;
  startDate: string;
  endDate: string;
  limit?: number;
}

interface GetSchedulesByDateRangeResult {
  schedules: Schedule[];
  count: number;
  range: {
    start: string;
    end: string;
  };
}

class ScheduleService {
  // 유저ID로 스케줄 목록 조회
  async getSchedulesByUserId(
    userId: number
  ): Promise<GetSchedulesByUserIdResult> {
    const schedules = await Schedule.findAll({
      where: { user_id: userId },
      order: [
        ["start_date", "ASC"],
        ["start_time", "ASC"],
      ],
    });

    return { schedules };
  }

  // 날짜 범위로 스케줄 목록 조회
  async getSchedulesByDateRange(
    params: GetSchedulesByDateRangeParams
  ): Promise<GetSchedulesByDateRangeResult> {
    const { userId, startDate, endDate, limit = 500 } = params;

    // DATEONLY 필드는 YYYY-MM-DD 형식의 문자열로 비교
    // Sequelize가 자동으로 DATEONLY 타입과 문자열을 비교할 때 날짜만 비교함
    const rangeStartStr = startDate; // YYYY-MM-DD 형식
    const rangeEndStr = endDate; // YYYY-MM-DD 형식

    // 월 경계를 가로지르는 이벤트도 포함하는 쿼리
    // 조건:
    // 1. start_date가 범위 내에 있음 (start_date >= rangeStart AND start_date <= rangeEnd)
    // 2. end_date가 범위 내에 있음 (end_date >= rangeStart AND end_date <= rangeEnd)
    // 3. 이벤트가 범위를 완전히 포함 (start_date <= rangeStart AND end_date >= rangeEnd)
    const schedules = await Schedule.findAll({
      where: {
        user_id: userId,
        [Op.or]: [
          // 시작일이 범위 내
          {
            start_date: {
              [Op.gte]: rangeStartStr,
              [Op.lte]: rangeEndStr,
            },
          },
          // 종료일이 범위 내
          {
            end_date: {
              [Op.gte]: rangeStartStr,
              [Op.lte]: rangeEndStr,
            },
          },
          // 이벤트가 범위를 완전히 포함
          {
            start_date: {
              [Op.lte]: rangeStartStr,
            },
            end_date: {
              [Op.gte]: rangeEndStr,
            },
          },
        ],
      },
      order: [
        ["start_date", "ASC"],
        ["start_time", "ASC"],
      ],
      limit: Math.min(limit, 1000),
    });

    return {
      schedules,
      count: schedules.length,
      range: {
        start: startDate,
        end: endDate,
      },
    };
  }

  // 스케줄 생성
  async createSchedule(
    params: CreateScheduleParams
  ): Promise<CreateScheduleResult> {
    const schedule = await Schedule.create({
      user_id: params.user_id,
      title: params.title,
      memo: params.memo ?? null,
      start_date: params.start_date,
      end_date: params.end_date,
      start_time: params.start_time ?? null,
      end_time: params.end_time ?? null,
      is_all_day: params.is_all_day,
      notification_enabled: params.notification_enabled,
    });

    return { schedule };
  }

  // 스케줄 ID와 유저 ID로 스케줄 조회 (권한 확인용)
  async findScheduleByIdAndUserId(
    scheduleId: number,
    userId: number
  ): Promise<Schedule | null> {
    const schedule = await Schedule.findOne({
      where: {
        schedule_id: scheduleId,
        user_id: userId,
      },
    });

    return schedule;
  }

  // 스케줄 수정
  async updateSchedule(
    params: UpdateScheduleParams
  ): Promise<UpdateScheduleResult> {
    const schedule = await this.findScheduleByIdAndUserId(
      params.schedule_id,
      params.user_id
    );

    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    // 업데이트할 필드만 설정
    const updateData: any = {};
    if (params.title !== undefined) updateData.title = params.title;
    if (params.memo !== undefined) updateData.memo = params.memo ?? null;
    if (params.start_date !== undefined)
      updateData.start_date = params.start_date;
    if (params.end_date !== undefined) updateData.end_date = params.end_date;
    if (params.start_time !== undefined)
      updateData.start_time = params.start_time ?? null;
    if (params.end_time !== undefined)
      updateData.end_time = params.end_time ?? null;
    if (params.is_all_day !== undefined)
      updateData.is_all_day = params.is_all_day;
    if (params.notification_enabled !== undefined)
      updateData.notification_enabled = params.notification_enabled;

    await schedule.update(updateData);

    return { schedule };
  }

  // 스케줄 삭제
  async deleteSchedule(
    scheduleId: number,
    userId: number
  ): Promise<DeleteScheduleResult> {
    const schedule = await this.findScheduleByIdAndUserId(scheduleId, userId);

    if (!schedule) {
      throw new ScheduleNotFoundError();
    }

    await schedule.destroy();

    return { message: "스케줄이 삭제되었습니다." };
  }
}

export const scheduleService = new ScheduleService();
