import { getComponent } from '/lib/xp/portal'
import { type Content, get as getContentByKey } from '/lib/xp/content'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { render } from '/lib/thymeleaf'
import { type KeyFigureView, parseKeyFigure } from '/lib/ssb/parts/keyFigure'

import { renderError } from '/lib/ssb/error/error'
import { data } from '/lib/util'
import { DATASET_BRANCH } from '/lib/ssb/repo/dataset'
import { FrontPageKeyFigureData, FrontpageKeyfigure } from '/lib/types/partTypes/frontpageKeyfigures'
import { type KeyFigure } from '/site/content-types'

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
  const part = getComponent<XP.PartComponent.FrontpageKeyfigures>()
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
