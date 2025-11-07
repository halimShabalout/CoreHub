export interface PaginationMeta {
  total: number;
  count: number;
  page?: number;
  limit?: number;
}

export interface Links {
  [key: string]: string | null;
}

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
  links?: Links;
  statusCode: number;
  message: string;
}
