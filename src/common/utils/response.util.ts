import { ApiResponse, PaginationMeta, Links } from './response.interface';

/**
 * Format a single resource with HATEOAS links
 */
export function formatSingle<T extends { id: number }>(
  resource: T,
  basePath: string
): T & { _links: Links } {
  return {
    ...resource,
    _links: {
      self: `${basePath}/${resource.id}`,
      edit: `${basePath}/${resource.id}`,
      delete: `${basePath}/${resource.id}`,
    },
  };
}

/**
 * Format list resources (no pagination yet, but prepared)
 */
export function formatList<T extends { id: number }>(
  resources: T[],
  basePath: string,
  options?: { page?: number; limit?: number }
): {
  data: (T & { _links: Links })[];
  meta: PaginationMeta;
  links: Links;
} {
  const page = options?.page ?? 1;
  const limit = options?.limit ?? resources.length;

  const data = resources.map((r) => formatSingle(r, basePath));

  const meta: PaginationMeta = {
    total: data.length,
    count: data.length,
    page,
    limit,
  };

  const links: Links = {
    self: `${basePath}?page=${page}&limit=${limit}`,
    next: null,
    prev: null,
  };

  return { data, meta, links };
}

/**
 * Final response wrapper
 */
export function wrapResponse<T>(
  data: T,
  meta?: PaginationMeta,
  links?: Links,
  message = 'successful',
  statusCode = 200
): ApiResponse<T> {
  return {
    data,
    meta,
    links,
    message,
    statusCode,
  };
}
