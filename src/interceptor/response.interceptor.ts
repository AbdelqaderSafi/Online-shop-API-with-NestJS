import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { PaginationResponseType, UnifiedResponse } from 'src/types/util.types';

@Injectable()
export class ResponseInterceptor<T extends Record<string, unknown>>
  implements NestInterceptor<T, UnifiedResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<UnifiedResponse<T>> {
    return next.handle().pipe(
      map((data: PaginationResponseType<T> | T) => {
        if (isPaginationResponse<T>(data)) {
          return {
            success: true,
            data: data.data,
            meta: data.meta,
          };
        }
        return {
          success: true,
          data: data,
        };
      }),
    );
  }
}
export const isPaginationResponse = <T>(
  data: Record<string, unknown>,
): data is PaginationResponseType<T> => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return data && typeof data === 'object' && 'data' in data && 'meta' in data;
};
