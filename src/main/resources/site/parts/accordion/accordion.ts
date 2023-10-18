import { get as getContentByKey, type Content } from '/lib/xp/content'
import { render } from '/lib/enonic/react4xp'
import type { Accordion } from '/site/content-types'
import { getComponent, getContent, processHtml } from '/lib/xp/portal'

const {
  data: { forceArray },
} = __non_webpack_require__('/lib/util')
const { sanitize } = __non_webpack_require__('/lib/xp/common')
const { renderError } = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<XP.PartComponent.Accordion>()?.config

    const accordionIds: Array<string> = config ? forceArray(config.accordion) : []
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
        ? forceArray(accordion.data.accordions).filter((accordion) => !!accordion)
        : []
      accordionContents.forEach((accordion) => {
        const items: Accordion['accordions'] = accordion.items ? forceArray(accordion.items) : []

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

export interface AccordionData {
  id?: string
  body?: string | undefined
  open?: string | undefined
  items?: Accordion['accordions']
}

interface AccordionProp {
  accordions: Array<AccordionData>
}
