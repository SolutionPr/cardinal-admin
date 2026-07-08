export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

function pickNumber(
  source: Record<string, unknown>,
  keys: string[],
): number | undefined {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim() && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return undefined;
}

export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
  return {
    page: Math.min(Math.max(page, 1), totalPages),
    limit,
    total,
    totalPages,
  };
}

export function extractPaginationMeta(
  response: unknown,
  fallback: PaginationMeta,
): PaginationMeta {
  if (!response || typeof response !== "object") return fallback;

  const root = response as Record<string, unknown>;
  const candidates = [
    root,
    root.meta,
    root.pagination,
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>)
      : undefined,
  ].filter((value): value is Record<string, unknown> => Boolean(value));

  for (const source of candidates) {
    const total = pickNumber(source, [
      "total",
      "totalCount",
      "total_count",
      "count",
    ]);
    const page = pickNumber(source, ["page", "currentPage", "current_page"]);
    const limit = pickNumber(source, ["limit", "pageSize", "page_size", "perPage", "per_page"]);
    const totalPages = pickNumber(source, [
      "totalPages",
      "total_pages",
      "lastPage",
      "last_page",
    ]);

    if (total !== undefined) {
      const resolvedLimit = limit ?? fallback.limit;
      return buildPaginationMeta(
        page ?? fallback.page,
        resolvedLimit,
        total,
      );
    }

    if (totalPages !== undefined && page !== undefined && limit !== undefined) {
      return {
        page,
        limit,
        total: totalPages * limit,
        totalPages,
      };
    }
  }

  return fallback;
}

export function paginateItems<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResult<T> {
  const total = items.length;
  const pagination = buildPaginationMeta(page, limit, total);
  const start = (pagination.page - 1) * pagination.limit;
  return {
    items: items.slice(start, start + pagination.limit),
    pagination,
  };
}
