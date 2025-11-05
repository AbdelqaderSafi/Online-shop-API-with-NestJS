import { Prisma } from 'generated/prisma';

export type PaginationQueryType = {
  page?: number;
  limit?: number;
};

export type PaginationResponseType<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type TransactionClient = Prisma.TransactionClient;
