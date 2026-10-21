import {
  CallHandler,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { catchError, Observable, throwError } from 'rxjs';

interface AppErrorPayload {
  code: string;
  message: string;
  statusCode: number;
}

@Injectable()
export class GrpcErrorsInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> {
    return next.handle().pipe(
      catchError((error: unknown) => {
        if (error instanceof HttpException) {
          return throwError(() => error);
        }

        const grpcError = error as {
          code?: number;
          details?: string;
        };
        console.log('gRPC status:', grpcError.code);
        console.log('gRPC details:', grpcError.details);
        if (typeof grpcError.details === 'string') {
          try {
            const payload: unknown = JSON.parse(grpcError.details);

            if (this.isAppErrorPayload(payload)) {
              return throwError(
                () =>
                  new HttpException(
                    {
                      error: {
                        code: payload.code,
                        message: payload.message,
                        statusCode: payload.statusCode,
                      },
                    },
                    payload.statusCode,
                  ),
              );
            }
          } catch (parseError) {
            if (parseError instanceof HttpException) {
              return throwError(() => parseError);
            }
          }
        }

        if (grpcError.code === GrpcStatus.UNAVAILABLE) {
          return throwError(
            () =>
              new HttpException(
                {
                  error: {
                    code: 'SYS-002',
                    message: 'Сервис временно недоступен',
                    statusCode: HttpStatus.SERVICE_UNAVAILABLE,
                  },
                },
                HttpStatus.SERVICE_UNAVAILABLE,
              ),
          );
        }

        if (grpcError.code === GrpcStatus.DEADLINE_EXCEEDED) {
          return throwError(
            () =>
              new HttpException(
                {
                  error: {
                    code: 'SYS-003',
                    message: 'Превышено время ожидания ответа сервиса',
                    statusCode: HttpStatus.GATEWAY_TIMEOUT,
                  },
                },
                HttpStatus.GATEWAY_TIMEOUT,
              ),
          );
        }

        console.error('Unhandled gRPC error:', error);

        return throwError(
          () =>
            new HttpException(
              {
                error: {
                  code: 'SYS-001',
                  message: 'Внутренняя ошибка сервера',
                  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                },
              },
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
        );
      }),
    );
  }

  private isAppErrorPayload(value: unknown): value is AppErrorPayload {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    const payload = value as Record<string, unknown>;

    return (
      typeof payload.code === 'string' &&
      typeof payload.message === 'string' &&
      typeof payload.statusCode === 'number' &&
      Number.isInteger(payload.statusCode) &&
      payload.statusCode >= 400 &&
      payload.statusCode <= 599
    );
  }
}
