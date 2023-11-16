import { getComponent, processHtml, sanitizeHtml } from '/lib/xp/portal'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part request', e)
  }
}

export function renderPart(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.RichText>()
    if (!part) throw Error('No part found')

    const processedText = processAndSanitizeText(part.config.text)

    const props = {
      text: processedText,
      textType: part.config.textType,
    }

    return r4xpRender('site/parts/richText/richText', props)
  } catch (error) {
    return renderError(req, 'Error loading the part', error)
  }
}

function processAndSanitizeText(text: string): string {
  let processedText = processHtml({
    value: text,
  })

  processedText = sanitizeHtml(processedText)

  return processedText
}
