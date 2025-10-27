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
