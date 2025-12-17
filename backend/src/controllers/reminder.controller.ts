import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildSuccess } from "../utils/response";
import { reminderService } from "../services/reminder.service";
import { UserNotFoundError } from "../errors/BusinessError";
import { ValidationError } from "../errors/ValidationError";
import {
  validateCreateReminderPayload,
  validateUpdateReminderPayload,
  validateUpdateReminderCompletePayload,
} from "../utils/validation/reminderValidator";

// 유저ID로 리마인더 목록 조회
export const getRemindersByUserId = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UserNotFoundError();
    }

    const { reminders } = await reminderService.getRemindersByUserId(userId);

    res
      .status(200)
      .json(
        buildSuccess(
          "REMINDERS_RETRIEVED",
          "리마인더 목록 조회에 성공했습니다.",
          reminders
        )
      );
  }
);

// 리마인더 생성
export const createReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      throw new UserNotFoundError();
    }

    const {
      title,
      memo,
      date,
      time,
      is_all_day = true,
      notification_enabled = false,
    } = req.body;

    // 입력값 검증
    validateCreateReminderPayload({
      title,
      memo,
      date,
      time,
      is_all_day,
      notification_enabled,
    });

    const { reminder } = await reminderService.createReminder({
      user_id: userId,
      title,
      memo: memo ?? null,
      date: date ? new Date(date) : null,
      time: time ?? null,
      is_all_day,
      notification_enabled,
    });

    res
      .status(201)
      .json(
        buildSuccess("REMINDER_CREATED", "리마인더가 생성되었습니다.", reminder)
      );
  }
);

// 리마인더 수정
export const updateReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const reminderIdParam = req.params.id;

    if (!userId) {
      throw new UserNotFoundError();
    }

    if (!reminderIdParam) {
      throw new ValidationError("유효하지 않은 리마인더 ID입니다.", "id");
    }

    const reminderId = parseInt(reminderIdParam);

    if (isNaN(reminderId)) {
      throw new ValidationError("유효하지 않은 리마인더 ID입니다.", "id");
    }

    const {
      title,
      memo,
      date,
      time,
      is_all_day,
      is_completed,
      notification_enabled,
    } = req.body;

    // 입력값 검증
    validateUpdateReminderPayload({
      title,
      memo,
      date,
      time,
      is_all_day,
      is_completed,
      notification_enabled,
    });

    const updateParams: any = {
      reminder_id: reminderId,
      user_id: userId,
    };

    if (title !== undefined) updateParams.title = title;
    if (memo !== undefined) updateParams.memo = memo;
    if (date !== undefined) updateParams.date = date ? new Date(date) : null;
    if (time !== undefined) updateParams.time = time;
    if (is_all_day !== undefined) updateParams.is_all_day = is_all_day;
    if (is_completed !== undefined) updateParams.is_completed = is_completed;
    if (notification_enabled !== undefined)
      updateParams.notification_enabled = notification_enabled;

    const { reminder } = await reminderService.updateReminder(updateParams);

    res
      .status(200)
      .json(
        buildSuccess("REMINDER_UPDATED", "리마인더가 수정되었습니다.", reminder)
      );
  }
);

// 리마인더 완료 상태만 업데이트 (PATCH)
export const patchReminderComplete = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const reminderIdParam = req.params.id;

    if (!userId) {
      throw new UserNotFoundError();
    }

    if (!reminderIdParam) {
      throw new ValidationError("유효하지 않은 리마인더 ID입니다.", "id");
    }

    const reminderId = parseInt(reminderIdParam);

    if (isNaN(reminderId)) {
      throw new ValidationError("유효하지 않은 리마인더 ID입니다.", "id");
    }

    const { isCompleted } = req.body;

    // 입력값 검증
    validateUpdateReminderCompletePayload({ isCompleted });

    const { reminder } = await reminderService.updateReminderComplete({
      reminder_id: reminderId,
      user_id: userId,
      is_completed: isCompleted,
    });

    res
      .status(200)
      .json(
        buildSuccess(
          "REMINDER_COMPLETE_UPDATED",
          "리마인더 완료 상태가 변경되었습니다.",
          reminder
        )
      );
  }
);

// 리마인더 삭제
export const deleteReminder = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user?.userId;
    const reminderIdParam = req.params.id;

    if (!userId) {
      throw new UserNotFoundError();
    }

    if (!reminderIdParam) {
      throw new ValidationError("유효하지 않은 리마인더 ID입니다.", "id");
    }

    const reminderId = parseInt(reminderIdParam);

    if (isNaN(reminderId)) {
      throw new ValidationError("유효하지 않은 리마인더 ID입니다.", "id");
    }

    const { message } = await reminderService.deleteReminder(
      reminderId,
      userId
    );

    res.status(200).json(buildSuccess("REMINDER_DELETED", message, null));
  }
);
