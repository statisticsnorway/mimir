import { get as getContentByKey, type Content } from '/lib/xp/content'
import { getComponent, getContent, processHtml } from '/lib/xp/portal'
import { sanitize } from '/lib/xp/common'
import { render } from '/lib/enonic/react4xp'

import * as util from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { type AccordionData, type AccordionProp } from '/lib/types/partTypes/accordion'
import { type Accordion } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<XP.PartComponent.Accordion>()?.config

    const accordionIds: Array<string> = config ? util.data.forceArray(config.accordion) : []
    return renderPart(req, accordionIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, accordionIds: Array<string> | string): XP.Response {
  try {
    const page = getContent<Content<Accordion>>()
    if (!page) throw Error('No page found')

    return page.type === `${app.name}:accordion`
      ? renderPart(req, [accordionIds as string])
      : renderPart(req, accordionIds as Array<string>)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, accordionIds: Array<string>) {
  const accordions: Array<AccordionData> = []

  accordionIds.forEach((key) => {
    const accordion: Content<Accordion> | null = key
      ? getContentByKey({
          key,
        })
      : null

    if (accordion) {
      const accordionContents: Accordion['accordions'] = accordion.data.accordions
        ? util.data.forceArray(accordion.data.accordions).filter((accordion) => !!accordion)
        : []
      accordionContents.forEach((accordion) => {
        const items: Accordion['accordions'] = accordion.items ? util.data.forceArray(accordion.items) : []

        accordions.push({
          id: accordion.open && sanitize(accordion.open),
          body:
            accordion.body &&
            processHtml({
              value: accordion.body,
            }),
          open: accordion.open,
          items: items.length
            ? items.map((item) => {
                return {
                  ...item,
                  body:
                    item.body &&
                    processHtml({
                      value: item.body,
                    }),
                }
              })
            : [],
        })
      })
    }
  })

  if (accordions.length === 0) {
    accordions.push({
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: [],
    })
  }

  const props: AccordionProp = {
    accordions,
  }

  return render('Accordion', props, req)
}
