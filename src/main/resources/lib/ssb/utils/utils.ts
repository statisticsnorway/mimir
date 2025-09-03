import { localize } from '/lib/xp/i18n'
import { get, getAttachmentStream, ByteSource, Content } from '/lib/xp/content'

import { getContent, pageUrl, assetUrl } from '/lib/xp/portal'
import { readLines } from '/lib/xp/io'
import { type PreliminaryData } from '/lib/types/xmlParser'
import { formatDate, fromNow } from '/lib/ssb/utils/dateUtils'
import { type SourceList, type SourcesConfig } from '/lib/types/sources'
import { type RowValue } from '/lib/types/util'
import { type Article, type Header } from '/site/content-types'
import { type ProfiledBox as ProfiledBoxPartConfig } from '/site/parts/profiledBox'

function numberWithSpaces(x: number | string): string {
  const parts: Array<string> = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return parts.join('.')
}

export function createHumanReadableFormat(value: number | string | null): string {
  if (getContent()?.language != 'en' && value) {
    return +value > 999 || +value < -999
      ? numberWithSpaces(value).toString().replace(/\./, ',')
      : value.toString().replace(/\./, ',')
  }
  return value ? (+value > 999 || +value < -999 ? numberWithSpaces(value) : value.toString()) : ''
}

export function dateToFormat(dateString: string | undefined): string {
  const dateFormatted: string | undefined = dateString ? formatDate(dateString, 'dd.MM.yyyy HH:mm', 'nb') : ''
  return dateFormatted ?? ''
}
export function dateToReadable(dateString: string | undefined): string {
  if (dateString) return fromNow(dateString, 'nb')
  return ''
}

export function isUrl(urlOrId: string | undefined): boolean | undefined {
  if (urlOrId) return urlOrId.includes('http')
  return
}

export function isNumber(str: number | string | undefined): boolean {
  return str != null && str !== '' && !isNaN(str as number)
}

function isNonBreakingSpace(str: string): boolean {
  return str.charCodeAt(0) == 160 && str.length === 1
}

export function getRowValue(
  value: number | string | PreliminaryData | Array<number | string | PreliminaryData>
): RowValue {
  if (typeof value === 'string' && isNumber(value) && !isNonBreakingSpace(value)) {
    return Number(value)
  }
  if (typeof value === 'object') {
    const valueObject: PreliminaryData = value as PreliminaryData
    const content: number | string = valueObject.content
    if (content) {
      return getRowValue(content)
    }
  }
  return value as RowValue
}

// Returns page mode for Kommunefakta page based on request mode or request path
export function pageMode(req: XP.Request): string {
  return req.params.municipality ? 'municipality' : 'map'
}

export function pathFromStringOrContent(urlSrc: Header['searchResultPage']): string | undefined {
  if (urlSrc !== undefined) {
    if (urlSrc._selected === 'content') {
      const selected: ContentSearchPageResult | undefined = urlSrc[urlSrc._selected]
      return selected && selected.contentId
        ? pageUrl({
            id: selected.contentId,
          })
        : undefined
    }

    if (urlSrc._selected === 'manual') {
      const selected: ManualSearchPageResult | undefined = urlSrc[urlSrc._selected]
      return selected && selected.url ? selected.url : undefined
    }
  }

  return undefined
}

/**
 *
 * @param {Object} sourceConfig
 * @return {array} a list of sources, text and url
 */
export function getSources(sourceConfig: Array<SourcesConfig>): SourceList {
  return sourceConfig.map((selectedSource) => {
    let sourceText = ''
    let sourceUrl = ''

    if (selectedSource._selected == 'urlSource') {
      sourceText = selectedSource.urlSource.urlText
      sourceUrl = selectedSource.urlSource.url
    }

    if (selectedSource._selected == 'relatedSource') {
      sourceText = selectedSource.relatedSource.urlText
      sourceUrl = pageUrl({
        id: selectedSource.relatedSource.sourceSelector,
      })
    }
    return {
      urlText: sourceText,
      url: sourceUrl,
    }
  })
}

export function getAttachmentContent(contentId: string | undefined): string | undefined {
  if (!contentId) return undefined
  const attachmentContent: Content | null = get({
    key: contentId,
  })

  return getAttachment(attachmentContent)
}

export function getAttachment(attachmentContent: Content | null): string | undefined {
  if (!attachmentContent) return undefined
  const stream: ByteSource | null = getAttachmentStream({
    key: attachmentContent._id,
    name: attachmentContent._name,
  })

  if (!stream) return undefined
  const lines: Array<string> = readLines(stream)
  return lines[0]
}

// For admin tool applications
export function parseContributions(contributions: XP.PageContributions): XP.PageContributions {
  if (!contributions) return contributions

  contributions.headEnd =
    contributions.headEnd &&
    (contributions.headEnd as Array<string>).map((script: string) => script.replace(' defer ', ' defer="" '))
  contributions.bodyEnd =
    contributions.bodyEnd &&
    (contributions.bodyEnd as Array<string>).map((script: string) => script.replace(' defer ', ' defer="" '))
  return contributions
}

// Generates 10 character random string, useful for unique ID's for elements etc.
// Cryptographically UNSAFE due to math.random, do NOT use for encryption or security.
export function randomUnsafeString(): string {
  return Math.random().toString(36).substring(2)
}

/**
 * Generated a script tag for a js file in /assets folder to be used in pageContributions
 * @param path Path to js file in /assets folder
 * @returns HTML script tag <script>
 */
export function scriptAsset(path: string): string {
  const url = assetUrl({ path })

  return `
  <script defer src="${url}" type="module"></script>
  <script defer src="${url.replace('.js', '.legacy.js')}" nomodule type="text/javascript"></script>
  `
}
// @ts-ignore
export const XP_RUN_MODE = ''.concat(Java.type('com.enonic.xp.server.RunMode').get())
// ^ check for DEV mode

export function getEnvironmentString(): string {
  let environment = ''
  if (XP_RUN_MODE === 'DEV') {
    environment = XP_RUN_MODE
  } else {
    environment = app.config?.['ssb.env'] ? app.config['ssb.env'].toUpperCase() : ''
  }
  return environment
}

export function getProfiledCardAriaLabel(subTitle: string): string {
  if (subTitle) {
    return `${subTitle.replace(' /', ',')}`
  }
  return ''
}

export function getLinkTargetUrl(urlContentSelector: ProfiledBoxPartConfig['urlContentSelector']): string | undefined {
  if (urlContentSelector?._selected == 'optionLink') {
    return urlContentSelector.optionLink.link
  }

  if (urlContentSelector?._selected == 'optionXPContent') {
    return urlContentSelector.optionXPContent.xpContent
      ? pageUrl({
          id: urlContentSelector.optionXPContent.xpContent,
        })
      : ''
  }
}

export function getLinkTargetContent(
  urlContentSelector: ProfiledBoxPartConfig['urlContentSelector']
): Content<Article> | null {
  if (urlContentSelector?._selected == 'optionXPContent') {
    return get({ key: urlContentSelector.optionXPContent.xpContent as string })
  }
  return null
}

export function getSubtitleForContent(
  XPContent: Content<Article>,
  language: string,
  overwriteType?: string | undefined,
  overwriteDate?: string | undefined
): string {
  const articleType = XPContent?.data.articleType ? `contentType.search.${XPContent.data.articleType}` : 'articleName'
  const articleNamePhrase: string = localize({
    key: articleType,
    locale: language,
  })

  let type
  if (overwriteType) {
    type = overwriteType
  } else if (XPContent?.type === `${app.name}:article`) {
    type = articleNamePhrase
  }

  let prettyDate
  if (overwriteDate) {
    prettyDate = formatDate(overwriteDate, 'PPP', language)
  } else if (XPContent?.publish && XPContent?.publish.from) {
    prettyDate = formatDate(XPContent.publish.from, 'PPP', language)
  } else {
    prettyDate = formatDate(XPContent?.createdTime, 'PPP', language)
  }

  return [type, prettyDate].filter((string) => string !== undefined).join(' / ')
}

interface ContentSearchPageResult {
  contentId?: string
}

interface ManualSearchPageResult {
  url?: string
}
