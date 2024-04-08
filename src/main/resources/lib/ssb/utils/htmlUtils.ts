import * as xss from 'xss'
/**
 * Cleans the string preventing XSS attacks.
 * @param html string that contains html
 * @returns string with clean html
 */
export function sanitize(html: string): string {
  const allowList = xss.getDefaultWhiteList()
  allowList.a?.push('id', 'name')
  return new xss.FilterXSS({
    allowCommentTag: true,
    allowList,
    escapeHtml: (text) => text,
  }).process(html)
}
