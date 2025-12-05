import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildSuccess } from "../utils/response";
import { scheduleService } from "../services/schedule.service";
import { UserNotFoundError } from "../errors/BusinessError";

// 유저ID로 스케줄 목록 조회
export const getSchedulesByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UserNotFoundError();
    }

    const { schedules } = await scheduleService.getSchedulesByUserId(userId);

    res
      .status(200)
      .json(
        buildSuccess(
          "SCHEDULES_RETRIEVED",
          "스케줄 목록 조회에 성공했습니다.",
          schedules
        )
      );
  }
);
