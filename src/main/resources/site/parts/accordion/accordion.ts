import { Content } from '/lib/xp/content'
import { React4xp, RenderResponse } from '/lib/enonic/react4xp'
import { Accordion } from '../../content-types/accordion/accordion'
import { AccordionConfig } from '../../macros/accordion/accordion-config'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent,
  getContent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  sanitize
} = __non_webpack_require__('/lib/xp/common')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = function(req: XP.Request): RenderResponse | XP.Response {
  try {
    const config: AccordionConfig = getComponent().config
    const accordionIds: Array<string> = config ? forceArray(config.accordion) : []
    return renderPart(req, accordionIds)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: XP.Request, accordionIds: Array<string> | string): RenderResponse | XP.Response {
  try {
    const page: Content<Accordion> = getContent()
    return page.type === `${app.name}:accordion` ? renderPart(req, [accordionIds as string]) : renderPart(req, accordionIds as Array<string>)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, accordionIds: Array<string>): RenderResponse {
  const accordions: Array<AccordionData> = []

  accordionIds.map((key) => {
    const accordion: Content<Accordion> | null = key ? get({
      key
    }) : null

    if (accordion) {
      const accordionContents: Accordion['accordions'] = accordion.data.accordions ? forceArray(accordion.data.accordions) : []
      accordionContents
        .filter((accordion) => !!accordion)
        .map((accordion) => {
          const items: Accordion['accordions'] = accordion.items ? forceArray(accordion.items) : []

          accordions.push({
            id: accordion.open && sanitize(accordion.open),
            body: accordion.body && processHtml({
              value: accordion.body
            }),
            open: accordion.open,
            items: items.length ? items.map((item) => {
              return {
                ...item,
                body: item.body && processHtml({
                  value: item.body
                })
              }
            }) : []
          })
        })
    }
  })

  if (accordions.length === 0) {
    accordions.push({
      body: 'Feil i lasting av innhold, innhold mangler eller kunne ikke hentes.',
      open: 'Sett inn innhold!',
      items: []
    })
  }

  const props: AccordionProp = {
    accordions
  }

  return React4xp.renderBody('Accordion', props, req)
}

export interface AccordionData {
  id?: string;
  body?: string | undefined;
  open?: string | undefined;
  items?: Accordion['accordions'];
}

interface AccordionProp {
  accordions: Array<AccordionData>;
}
