export function sanitizeForSolr(term: string): string {
  return term
    .replace(/['<>;.,´`"]/g, '')
    .replaceAll('\\+', '&2B')
}
