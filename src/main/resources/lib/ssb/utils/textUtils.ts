export function sanitizeForSolr(term: string): string {
  return term.replace(/['<>;.,´`"]/g, '').replace(/\\+/g, '&2B')
}

export function stripHtmlFromText(text: string): string {
  return text.replace(/<[^>]*>/g, '')
}
