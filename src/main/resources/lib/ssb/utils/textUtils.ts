
export function sanitizeForSolr(term: string): string {
  return term.replace('\'', '')
    .replace('<', '')
    .replace('>', '')
    .replace(';', '')
    .replace('.', '')
    .replace(',', '')
    .replace('´', '')
    .replace('`', '')
    .replace('"', '')
}

export interface TextUtilsLib {
  sanitizeForSolr: (term: string) => string;
}
