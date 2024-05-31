import { renderError } from '/lib/ssb/error/error'
import { type KeyFigure as KeyFigureConfig } from '/site/macros/keyFigure'
import { preview as dividerControllerPreview } from '/site/parts/divider/divider'
import { preview } from '/site/parts/keyFigure/keyFigure'

export function macro(context: XP.MacroContext<KeyFigureConfig>): XP.Response {
  try {
    const divider: XP.Response = dividerControllerPreview(context.request, {
      dark: false,
    })

    const config = context.params
    const keyFigure = preview(context.request, config.keyFigure)
    log.info('\x1b[32m%s\x1b[0m', JSON.stringify(keyFigure.props, null, 2))

    if (keyFigure.status && keyFigure.status !== 200) throw new Error(`keyFigure with id ${config.keyFigure} missing`)

    // const keyFigureComponent = { props: { keyFigures: [{ greenBox: null }] }, ...keyFigure }
    // Denne er ikke med på at det kan være props på denne, men log.info over viser at objektet har det. Linjen over løser ts-feilen, men det er en veldig lite pen løsning og en skikkelig hack. Trenger tips for å få typen inn riktig.
    if (keyFigure.props?.keyFigures[0]?.greenBox) {
      keyFigure.body = `<div class="macro-keyfigure">${keyFigure.body}</div>`
    } else {
      keyFigure.body = `${divider.body} ${keyFigure.body} ${divider.body}`
    }

    return keyFigure
  } catch (e) {
    return renderError(context.request, 'Error in macro', e)
  }
}
