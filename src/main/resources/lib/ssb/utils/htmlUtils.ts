import * as xss from 'xss'
/**
 * Cleans the string preventing XSS attacks.
 * @param html string that contains html
 * @returns string with clean html
 */
export function sanitizeHtml(html: string): string {
  console.log(JSON.stringify(xss.whiteList))
  return 'clean- ' + new xss.FilterXSS().process(html) + '-/clean'
}
