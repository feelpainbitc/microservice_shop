import { HttpException } from "@nestjs/common";
import { ErrorCode } from "./error-codes";

export interface AppErrorResponse {
  error: {
    code: ErrorCode;
    message: string;
    statusCode: number;
  };
}

export class AppException extends HttpException {
  constructor(code: ErrorCode, message: string, statusCode: number) {
    const response: AppErrorResponse = {
      error: {
        code,
        message,
        statusCode,
      },
    };

    super(response, statusCode);
  }
}
