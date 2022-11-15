import {getComponent, processHtml, type Component} from "/lib/xp/portal";
import type {FactBoxPartConfig} from "./factBox-part-config";
import {render as r4XpRender, type RenderResponse} from '/lib/enonic/react4xp'
import {get as getContentByKey, type Content} from "/lib/xp/content";
import type {FactBox} from "../../content-types/factBox/factBox";
import {type ResourceKey, render} from '/lib/thymeleaf'

const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const view: ResourceKey = resolve('./factBox.html')

export function get(req: XP.Request): XP.Response | RenderResponse {
  try {
    const part: Component<FactBoxPartConfig> = getComponent()
    return renderPart(req, part.config.factBox)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, id: string) {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, factBoxId: string): XP.Response | RenderResponse {
  // throw an error if there is no selected factbox, or an empty section for edit mode
  if (!factBoxId) {
    if (req.mode === 'edit') {
      return {
        body: render(view)
      }
    } else {
      throw new Error('Factbox - Missing Id')
    }
  }
  const factBoxContent: Content<FactBox> | null = getContentByKey({
    key: factBoxId
  })
  if (!factBoxContent) throw new Error(`FactBox with id ${factBoxId} doesn't exist`)
  const text: string = processHtml({
    value: factBoxContent.data.text.replace(/&nbsp;/g, ' ')
  })
  const body: string = render(view)
  return r4XpRender(
    'FactBox',
    {
      header: factBoxContent.displayName,
      text
    },
    req,
    {
      body: body
    })
}
