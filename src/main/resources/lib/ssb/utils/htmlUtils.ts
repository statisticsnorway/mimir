import * as xss from 'xss'
/**
 * Cleans the string preventing XSS attacks.
 * @param html string that contains html
 * @returns string with clean html
 */
export function sanitize(html: string): string {
  return new xss.FilterXSS({ allowCommentTag: true, escapeHtml: (text) => text }).process(html)
}
