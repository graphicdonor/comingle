export const SEARCH_RESULT_LIMIT = 10;

/**
 * Builds one `column.ilike."pattern"` clause for a PostgREST `.or()` filter
 * string. `.or()` parses its argument as a small filter DSL (commas
 * separate conditions, `.` separates column/operator/value) — interpolating
 * raw user text into it isn't just a correctness bug (literal `%`/`_`
 * wildcards, commas splitting into extra conditions) but a filter-injection
 * risk, since a crafted value could add unintended conditions. This escapes
 * both layers: backslash-escapes ILIKE wildcards in the search text, then
 * wraps the whole pattern in double quotes (doubling any embedded quote)
 * exactly as PostgREST's own filter syntax requires for values containing
 * reserved characters.
 */
export function ilikeCondition(column: string, query: string): string {
  const escapedForLike = query.replace(/[%_\\]/g, (match) => `\\${match}`);
  const pattern = `%${escapedForLike}%`;
  const quoted = pattern.replace(/"/g, '""');
  return `${column}.ilike."${quoted}"`;
}

export function orConditions(query: string, columns: string[]): string {
  return columns.map((column) => ilikeCondition(column, query)).join(",");
}
