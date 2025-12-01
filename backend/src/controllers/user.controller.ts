import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { buildSuccess } from "../utils/response";
import { userService } from "../services/user.service";
import { UserNotFoundError } from "../errors/BusinessError";

// 사용자 정보 조회
export const getUserInfo = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user?.userId;

  // 유저 정보를 불러오는 데 실패하였습니다로 변경?
  if (!userId) {
    throw new UserNotFoundError();
  }

  const user = await userService.findById(userId);

  if (!user) {
    throw new UserNotFoundError();
  }

  const { password_hash, ...userInfo } = user.toJSON();

  res
    .status(200)
    .json(
      buildSuccess(
        "USER_INFO_RETRIEVED",
        "사용자 정보 조회에 성공했습니다.",
        userInfo
      )
    );
});
