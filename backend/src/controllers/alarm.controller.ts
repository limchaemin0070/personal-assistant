import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildSuccess } from "../utils/response";
import { alarmService } from "../services/alarm.service";
import { UserNotFoundError } from "../errors/BusinessError";
import { ValidationError } from "../errors/ValidationError";
import {
  validateCreateAlarmPayload,
  validateUpdateAlarmPayload,
  validateUpdateAlarmActivePayload,
} from "../utils/validation/alarmValidator";

// 유저ID로 알람 목록 조회
export const getAlarmsByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UserNotFoundError();
    }

    const { alarms } = await alarmService.getAlarmsByUserId(userId);

    res
      .status(200)
      .json(
        buildSuccess(
          "ALARMS_RETRIEVED",
          "알람 목록 조회에 성공했습니다.",
          alarms
        )
      );
  }
);

// 알람 생성
export const createAlarm = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  if (!userId) {
    throw new UserNotFoundError();
  }

  const {
    title,
    date,
    time,
    is_repeat = false,
    repeat_days,
    is_active = true,
    alarm_type,
  } = req.body;

  // 입력값 검증
  validateCreateAlarmPayload({
    title,
    date,
    time,
    is_repeat,
    repeat_days,
    is_active,
    alarm_type,
  });

  const { alarm } = await alarmService.createAlarm({
    user_id: userId,
    title: title ?? null,
    date: date ?? null,
    time,
    is_repeat,
    repeat_days: repeat_days ?? null,
    is_active,
    alarm_type,
  });

  res
    .status(201)
    .json(buildSuccess("ALARM_CREATED", "알람이 생성되었습니다.", alarm));
});

// 알람 수정
export const updateAlarm = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const alarmId = parseInt(req.params.id || "");

  if (!userId) {
    throw new UserNotFoundError();
  }

  if (isNaN(alarmId)) {
    throw new ValidationError("유효하지 않은 알람 ID입니다.", "id");
  }

  const { title, date, time, is_repeat, repeat_days, is_active, alarm_type } =
    req.body;

  // 입력값 검증
  validateUpdateAlarmPayload({
    title,
    date,
    time,
    is_repeat,
    repeat_days,
    is_active,
    alarm_type,
  });

  const updateParams: any = {
    alarm_id: alarmId,
    user_id: userId as number,
  };

  if (title !== undefined) updateParams.title = title ?? null;
  if (date !== undefined) updateParams.date = date ?? null;
  if (time !== undefined) updateParams.time = time;
  if (is_repeat !== undefined) updateParams.is_repeat = is_repeat;
  if (repeat_days !== undefined) updateParams.repeat_days = repeat_days ?? null;
  if (is_active !== undefined) updateParams.is_active = is_active;
  if (alarm_type !== undefined) updateParams.alarm_type = alarm_type;

  const { alarm } = await alarmService.updateAlarm(updateParams);

  res
    .status(200)
    .json(buildSuccess("ALARM_UPDATED", "알람이 수정되었습니다.", alarm));
});

// 알람 활성 상태만 업데이트 (PATCH)
export const patchAlarmActive = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const alarmId = parseInt(req.params.id || "");

    if (!userId) {
      throw new UserNotFoundError();
    }

    if (isNaN(alarmId)) {
      throw new ValidationError("유효하지 않은 알람 ID입니다.", "id");
    }

    const { isActive } = req.body;

    // 입력값 검증
    validateUpdateAlarmActivePayload({ isActive });

    const { alarm } = await alarmService.updateAlarmActive({
      alarm_id: alarmId,
      user_id: userId as number,
      is_active: isActive,
    });

    res
      .status(200)
      .json(
        buildSuccess(
          "ALARM_ACTIVE_UPDATED",
          "알람 활성 상태가 변경되었습니다.",
          alarm
        )
      );
  }
);

// 알람 삭제
export const deleteAlarm = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;
  const alarmId = parseInt(req.params.id || "");

  if (!userId) {
    throw new UserNotFoundError();
  }

  if (isNaN(alarmId)) {
    throw new ValidationError("유효하지 않은 알람 ID입니다.", "id");
  }

  const { message } = await alarmService.deleteAlarm(alarmId, userId as number);

  res.status(200).json(buildSuccess("ALARM_DELETED", message, null));
});
