export interface APIResponse<T> {
  msg: string;
  code: number;
  data?: T;
}

export function successResponse<T>(
  msg: string = 'Ok',
  code: number = 200,
  data: T,
): APIResponse<T> {
  return {
    msg,
    code,
    data,
  };
}

export function errorResponse(msg: string, code: number): APIResponse<void> {
  return {
    msg,
    code,
  };
}
