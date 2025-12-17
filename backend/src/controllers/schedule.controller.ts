import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildSuccess } from "../utils/response";
import { scheduleService } from "../services/schedule.service";
import { UserNotFoundError } from "../errors/BusinessError";
import { ValidationError } from "../errors/ValidationError";
import {
  validateCreateSchedulePayload,
  validateUpdateSchedulePayload,
} from "../utils/validation/scheduleValidator";

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

// 스케줄 생성
export const createSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UserNotFoundError();
    }

    const {
      title,
      memo,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day = true,
      notification_enabled = false,
    } = req.body;

    // 입력값 검증
    validateCreateSchedulePayload({
      title,
      memo,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day,
      notification_enabled,
    });

    const { schedule } = await scheduleService.createSchedule({
      user_id: userId,
      title,
      memo: memo ?? null,
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      start_time: start_time ?? null,
      end_time: end_time ?? null,
      is_all_day,
      notification_enabled,
    });

    res.status(201).json(
      buildSuccess(
        "SCHEDULE_CREATED",
        "스케줄이 생성되었습니다.",
        schedule
      )
    );
  }
);

// 스케줄 수정
export const updateSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const scheduleIdParam = req.params.id;

    if (!userId) {
      throw new UserNotFoundError();
    }

    if (!scheduleIdParam) {
      throw new ValidationError("유효하지 않은 스케줄 ID입니다.", "id");
    }

    const scheduleId = parseInt(scheduleIdParam);

    if (isNaN(scheduleId)) {
      throw new ValidationError("유효하지 않은 스케줄 ID입니다.", "id");
    }

    const {
      title,
      memo,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day,
      notification_enabled,
    } = req.body;

    // 입력값 검증
    validateUpdateSchedulePayload({
      title,
      memo,
      start_date,
      end_date,
      start_time,
      end_time,
      is_all_day,
      notification_enabled,
    });

    const updateParams: any = {
      schedule_id: scheduleId,
      user_id: userId,
    };

    if (title !== undefined) updateParams.title = title;
    if (memo !== undefined) updateParams.memo = memo;
    if (start_date !== undefined) updateParams.start_date = new Date(start_date);
    if (end_date !== undefined) updateParams.end_date = new Date(end_date);
    if (start_time !== undefined) updateParams.start_time = start_time;
    if (end_time !== undefined) updateParams.end_time = end_time;
    if (is_all_day !== undefined) updateParams.is_all_day = is_all_day;
    if (notification_enabled !== undefined) updateParams.notification_enabled = notification_enabled;

    const { schedule } = await scheduleService.updateSchedule(updateParams);

    res.status(200).json(
      buildSuccess(
        "SCHEDULE_UPDATED",
        "스케줄이 수정되었습니다.",
        schedule
      )
    );
  }
);

// 스케줄 삭제
export const deleteSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const scheduleIdParam = req.params.id;

    if (!userId) {
      throw new UserNotFoundError();
    }

    if (!scheduleIdParam) {
      throw new ValidationError("유효하지 않은 스케줄 ID입니다.", "id");
    }

    const scheduleId = parseInt(scheduleIdParam);

    if (isNaN(scheduleId)) {
      throw new ValidationError("유효하지 않은 스케줄 ID입니다.", "id");
    }

    const { message } = await scheduleService.deleteSchedule(
      scheduleId,
      userId
    );

    res.status(200).json(
      buildSuccess(
        "SCHEDULE_DELETED",
        message,
        null
      )
    );
  }
);
