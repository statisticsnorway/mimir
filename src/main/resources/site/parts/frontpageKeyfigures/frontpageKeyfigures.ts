import { render } from '/lib/thymeleaf'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { getComponent } from '/lib/xp/portal'
import type { FrontpageKeyfigures as FrontpageKeyfiguresPartConfig } from '.'
import { type Content, get as getContentByKey } from '/lib/xp/content'
import type { KeyFigure } from '/site/content-types'
import type { KeyFigureView } from '/lib/ssb/parts/keyFigure'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { data } = __non_webpack_require__('/lib/util')
const { parseKeyFigure } = __non_webpack_require__('/lib/ssb/parts/keyFigure')
const { DATASET_BRANCH } = __non_webpack_require__('/lib/ssb/repo/dataset')

const view = resolve('./frontpageKeyfigures.html')

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

const isKeyfigureData = (data: FrontPageKeyFigureData | undefined): data is FrontPageKeyFigureData => {
  return !!data
} // user-defined type guards <3

function renderPart(req: XP.Request): XP.Response {
  const part = getComponent<FrontpageKeyfiguresPartConfig>()
  if (!part) throw Error('No part found')

  const keyFiguresPart: Array<FrontpageKeyfigure> = part.config.keyfiguresFrontpage
    ? data.forceArray(part.config.keyfiguresFrontpage)
    : []

  const frontpageKeyfigures: Array<FrontPageKeyFigureData | undefined> = keyFiguresPart.map(
    (keyFigure: FrontpageKeyfigure) => {
      const keyFigureContent: Content<KeyFigure> | null = keyFigure.keyfigure
        ? getContentByKey({
            key: keyFigure.keyfigure,
          })
        : null

      if (keyFigureContent) {
        const keyFigureData: KeyFigureView = parseKeyFigure(keyFigureContent, undefined, DATASET_BRANCH)
        return {
          id: keyFigureContent._id,
          title: keyFigureData.title,
          urlText: keyFigure.urlText,
          url: keyFigure.url,
          number: keyFigureData.number,
          numberDescription: keyFigureData.numberDescription,
          noNumberText: keyFigureData.noNumberText,
        }
      } else return undefined
    }
  )

  const frontPagefiguresCleaned: Array<FrontPageKeyFigureData> = frontpageKeyfigures.filter(isKeyfigureData)

  return frontpageKeyfigures && frontpageKeyfigures.length > 0
    ? renderFrontpageKeyfigures(req, frontPagefiguresCleaned)
    : {
        body: '',
        contentType: 'text/html',
      }
}

function renderFrontpageKeyfigures(req: XP.Request, frontpageKeyfigures: Array<FrontPageKeyFigureData>) {
  return r4XpRender(
    'FrontpageKeyfigures',
    {
      keyFigures: frontpageKeyfigures.map((frontpageKeyfigure) => {
        return {
          ...frontpageKeyfigure,
        }
      }),
    },
    req,
    {
      body: render(view),
    }
  )
}

interface FrontpageKeyfigure {
  keyfigure?: string
  urlText: string
  url: string
}

interface FrontPageKeyFigureData {
  id: string
  title: string
  urlText: string
  url: string
  number?: string
  numberDescription?: string
  noNumberText: string
}
