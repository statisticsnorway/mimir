import { getComponent, processHtml } from '/lib/xp/portal'
import { render as r4xpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part request', e)
  }
}

export interface SSBTextConfig {
  text: string
  textType: string
}

export interface SSBTextProps {
  text: string
  textType: string,
  isEdit: boolean
}

export function renderPart(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.SSBText>()
    if (!part) throw Error('No part found')

    const config = part.config
    const textType = config.textType || 'default'
    const text = processHtml({ value: config.text || '' }).replace(/<(\/*)p>/gm, '<$1span>')

    const props: SSBTextProps = {
      text,
      textType,
      isEdit: req.mode === 'edit'
    }

    return r4xpRender('site/parts/SSBText/SSBText', props, req)
  } catch (error) {
    return renderError(req, 'Error loading the part', error)
  }
}
