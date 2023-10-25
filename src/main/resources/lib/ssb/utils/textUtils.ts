export function sanitizeForSolr(term: string): string {
  return term
    .replace("'", '')
    .replace('<', '')
    .replace('>', '')
    .replace(';', '')
    .replace('.', '')
    .replace(',', '')
    .replace('´', '')
    .replace('`', '')
    .replace('"', '')
    .replace('\\+', '&2B')
}
