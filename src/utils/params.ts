export type SearchParams = Record<string, string | string[] | undefined>;

export function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function pageFrom(value: string | string[] | undefined): number {
  const n = Math.trunc(Number(first(value)));
  return Number.isFinite(n) && n >= 1 ? n : 1;
}
