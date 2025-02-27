export function sanitizeForSolr(term: string): string {
  return term.replace(/['<>;.,´`"]/g, '').replace(/\\+/g, '&2B')
}
