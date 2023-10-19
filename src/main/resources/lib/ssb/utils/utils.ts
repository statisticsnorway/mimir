import { get, getAttachmentStream, ByteSource, Content } from '/lib/xp/content'
import type { Header } from '/site/content-types'
import { PreliminaryData } from '/lib/types/xmlParser'
import { formatDate, fromNow } from '/lib/ssb/utils/dateUtils'

const { getContent, pageUrl, assetUrl } = __non_webpack_require__('/lib/xp/portal')
const { readLines } = __non_webpack_require__('/lib/xp/io')

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

export type RowValue = number | string

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
  return `<script defer src="${assetUrl({ path })}"></script>`
}
// @ts-ignore
export const XP_RUN_MODE = ''.concat(Java.type('com.enonic.xp.server.RunMode').get())
// ^ check for DEV mode

export interface SourcesConfig {
  _selected: string
  urlSource: {
    urlText: string
    url: string
  }
  relatedSource: {
    urlText: string
    sourceSelector: string
  }
}

interface Sources {
  urlText: string
  url: string
}
interface ContentSearchPageResult {
  contentId?: string
}

interface ManualSearchPageResult {
  url?: string
}

export type SourceList = Array<Sources>
export interface UtilsLib {
  createHumanReadableFormat: (value: number | string | null) => string
  dateToFormat: (dateString: string | undefined) => string
  dateToReadable: (dateString: string | undefined) => string
  isUrl: (urlOrId: string | undefined) => boolean | undefined
  isNumber: (str: number | string | undefined) => boolean
  getRowValue: (value: number | string | PreliminaryData | Array<number | string | PreliminaryData>) => RowValue
  pageMode: (req: XP.Request) => string
  pathFromStringOrContent: (urlSrc: Header['searchResultPage']) => string | undefined
  getSources: (sourceConfig: Array<SourcesConfig>) => SourceList
  getAttachmentContent: (contentId: string | undefined) => string | undefined
  getAttachment: (attachmentContent: Content | null) => string | undefined
  parseContributions: (contributions: XP.PageContributions) => XP.PageContributions
}
