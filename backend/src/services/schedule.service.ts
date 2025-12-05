import { Schedule } from "../models/Schedule.model";

interface GetSchedulesByUserIdResult {
  schedules: Schedule[];
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
}

export const scheduleService = new ScheduleService();
