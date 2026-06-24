export type ApiError = {
  error: string;
  code:
    | "UNAUTHORIZED"
    | "NOT_FOUND"
    | "VALIDATION_ERROR"
    | "FORBIDDEN"
    | "CONFLICT"
    | "INTERNAL_ERROR";
};

export type SuccessResponse<T> = {
  data: T;
};

export type ApiResponse<T> = SuccessResponse<T> | ApiError;
