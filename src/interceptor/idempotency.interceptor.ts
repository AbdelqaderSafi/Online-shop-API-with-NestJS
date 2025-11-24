import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  BadRequestException,
} from '@nestjs/common';
import { catchError, map, mergeMap, Observable, of } from 'rxjs';
import { PaginationResponseType, UnifiedResponse } from 'src/types/util.types';
import { isPaginationResponse } from './response.interceptor';
import { DatabaseService } from 'src/modules/database/database.service';
import th from 'zod/v4/locales/th.js';
import { Prisma } from 'generated/prisma/wasm';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(private prismaService: DatabaseService) {}
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<SafeObject>> {
    const request = context.switchToHttp().getRequest<Request>();
    const idempotencyKey = request.headers['idempotency-key'];
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency key is missing');
    }

    try {
      await this.prismaService.idempotency.create({
        data: {
          idempotencyKey: idempotencyKey as string,
          idempotencyStatus: 'IN_PROGRESS',
          expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
        },
      });

      return next.handle().pipe(
        mergeMap(async (responseData: SafeObject) => {
          await this.prismaService.idempotency.update({
            where: { idempotencyKey: idempotencyKey as string },
            data: {
              idempotencyStatus: 'COMPLETED',
              response: responseData as Prisma.InputJsonValue,
            },
          });
          return responseData;
        }),
        catchError(async (err) => {
          await this.prismaService.idempotency.update({
            where: { idempotencyKey: idempotencyKey as string },
            data: {
              idempotencyStatus: 'COMPLETED',
              response: Prisma.JsonNull,
            },
          });
          throw err;
        }),
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const existingRecord =
          await this.prismaService.idempotency.findUniqueOrThrow({
            where: { idempotencyKey: idempotencyKey as string },
          });
        // cheack status
        switch (existingRecord.idempotencyStatus) {
          case 'IN_PROGRESS':
            throw new BadRequestException(
              'A request with this idempotency key is already in progress',
            );
          case 'COMPLETED':
            return of(existingRecord.response as SafeObject);
          default:
            break;
        }
      }
      throw error;
    }
  }
}

type SafeObject = Record<string, unknown>;
