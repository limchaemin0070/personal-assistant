// 응답 빌더 유틸

interface SuccessResponse<T> {
  success: true;
  code: string;
  message: string;
  result: T | null;
}

interface ErrorResponse<T = null> {
  success: false;
  code: string;
  message: string;
  result: T;
}

// result에 넣어줘야 하는 데이터가 있으면 service 계층에서 정의해서 내려주기
// 없으면 null

export const buildSuccess = <T = null>(
  code: string,
  message: string,
  result?: T
): SuccessResponse<T> => ({
  success: true,
  code,
  message,
  result: (result ?? null) as T | null,
});

export const buildError = <T = null>(
  code: string,
  message: string,
  result?: T
): ErrorResponse<T | null> => ({
  success: false,
  code,
  message,
  result: (result ?? null) as T | null,
});
