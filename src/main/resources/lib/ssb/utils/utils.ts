import { ByteSource, Content } from 'enonic-types/content'
import { Request } from 'enonic-types/controller'

const {
  get,
  getAttachmentStream
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent,
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  readLines
} = __non_webpack_require__('/lib/xp/io')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

/**
 * The timestamp from enonic contains 6 millisecond decimals. This is not supported in
 * today's nashorn and therefor it cannot create new date object with it. This function
 * removes the last 3 digits.
 * @param {string} timestamp in iso format: 2020-10-14T08:15:24.307260Z
 * @return {string} timestamp in iso format: 2020-10-14T08:15:24.307Z
 */
function removeLast3Digits(timestamp: string): string {
  const groupRegexp: RegExp = /([0-9\-]{8,10}T[0-9\:]{6,8}.[0-9]{3})(?:[0-9])*(Z)/gm
  const matched: Array<string> | null = groupRegexp.exec(timestamp)
  return matched && matched.length > 1 ? `${matched[1]}${matched[2]}` : timestamp
}

function numberWithSpaces(x: number | string): string {
  const parts: Array<string> = x.toString().split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0')
  return parts.join('.')
}

export function isPublished(content: Content): boolean {
  return content.publish && content.publish.from ? (new Date(removeLast3Digits(content.publish.from))) < (new Date()) : false
}

export function createHumanReadableFormat(value: number | string): string {
  if (getContent().language != 'en') {
    return value > 999 || value < -999 ? numberWithSpaces(value).toString().replace(/\./, ',') : value.toString().replace(/\./, ',')
  } else {
    return value > 999 || value < -999 ? numberWithSpaces(value) : value.toString()
  }
}

// Returns page mode for Kommunefakta page based on request mode or request path
export function pageMode(req: Request): string {
  return req.params.municipality ? 'municipality' : 'map'
}

export function pathFromStringOrContent(urlSrc: StringOrContent): string | undefined {
  if (urlSrc !== undefined) {
    if (urlSrc._selected === 'content') {
      const selected: SelectedStringOrContent = urlSrc[urlSrc._selected]
      return selected && selected.contentId ? pageUrl({
        id: selected.contentId
      }) : undefined
    }

    if (urlSrc._selected === 'manual') {
      const selected: SelectedStringOrContent = urlSrc[urlSrc._selected]
      return selected && selected.url ? selected.url : undefined
    }
  }

  return undefined
}

export function getImageCaption(imageId: string): string {
  const imageContent: ImageContent | null = get({
    key: imageId
  })
  return imageContent && imageContent !== undefined ? imageContent.data.caption : ' '
}

export function getImageAlt(imageId: string): string {
  const imageContent: ImageContent | null = get({
    key: imageId
  })
  return imageContent && imageContent !== undefined ? imageContent.data.altText : ' '
}

export function isUrl(urlOrId: string): boolean {
  return urlOrId.includes('http')
}

export function dateToFormat(ds: string): string {
  return moment(ds).locale('nb').format('DD.MM.YYYY HH:mm')
}
export function dateToReadable(ds: string): string {
  return moment(ds).locale('nb').fromNow()
}

/**
 *
 * @param {Object} sourceConfig
 * @return {array} a list of sources, text and url
 */
export function getSources(sourceConfig: Array<Sources>): object {
  return sourceConfig.map((selectedSource) => {
    let sourceText: string = ''
    let sourceUrl: string = ''

    if (selectedSource._selected == 'urlSource') {
      sourceText = selectedSource.urlSource.urlText
      sourceUrl = selectedSource.urlSource.url
    }

    if (selectedSource._selected == 'relatedSource') {
      sourceText = selectedSource.relatedSource.urlText
      sourceUrl = pageUrl({
        id: selectedSource.relatedSource.sourceSelector
      })
    }
    return {
      urlText: sourceText,
      url: sourceUrl
    }
  })
}

export function getAttachmentContent(contentId: string | undefined): string | undefined {
  if (!contentId) return undefined
  const attachmentContent: Content | null = get({
    key: contentId
  })

  if (!attachmentContent) return undefined
  const stream: ByteSource | null = getAttachmentStream({
    key: attachmentContent._id,
    name: attachmentContent._name
  })

  if (!stream) return undefined
  const lines: Array<string> = readLines(stream)
  return lines[0]
}

export function getRowValue(value: number | string | RowValueObject): number | string | RowValueObject {
  if (typeof value === 'string' && isNumber(value)) {
    return Number(value)
  }
  if (typeof value === 'object' && value.content != undefined) {
    return getRowValue(value.content)
  }
  return value
}

export function isNumber(str: number | string | undefined): boolean {
  return ((str != null) && (str !== '') && !isNaN(str as number))
}
interface ImageContent {
  data: {
    caption: string;
    altText: string;
  };
}
interface Sources {
  _selected: string;
  urlSource: {
    urlText: string;
    url: string;
  };
  relatedSource: {
    urlText: string;
    sourceSelector: string;
  };
}
interface StringOrContent {
  _selected: string;
  manual: {
      url?: string | undefined;
  };
  content: {
      contentId?: string | undefined;
  };
}

interface SelectedStringOrContent {
  url?: string;
  contentId?: string;
}
interface RowValueObject {
  content: string | number;
}
