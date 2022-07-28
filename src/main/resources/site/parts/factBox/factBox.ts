import {Component} from "enonic-types/portal";
import {FactBoxPartConfig} from "./factBox-part-config";
import {React4xpObject, React4xpResponse} from "../../../lib/types/react4xp";
import {Content} from "enonic-types/content";
import {FactBox} from "../../content-types/factBox/factBox";
import { ResourceKey, render } from 'enonic-types/thymeleaf'

const {
  getComponent,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const content = __non_webpack_require__('/lib/xp/content')

const view: ResourceKey = resolve('./factBox.html')

exports.get = function(req: XP.Request): XP.Response | React4xpResponse {
  try {
    const part: Component<FactBoxPartConfig> = getComponent()
    return renderPart(req, part.config.factBox)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req: XP.Request, id: string) {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, factBoxId: string): XP.Response | React4xpResponse {
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
  const factBoxContent: Content<FactBox> | null = content.get({
    key: factBoxId
  })
  if (!factBoxContent) throw new Error(`FactBox with id ${factBoxId} doesn't exist`)
  const text: string = processHtml({
    value: factBoxContent.data.text.replace(/&nbsp;/g, ' ')
  })
  const factBox: React4xpObject = new React4xp('FactBox')
    .setProps({
      header: factBoxContent.displayName,
      text
    })
    .setId('fact-box')
    .uniqueId()

  const body: string = render(view, {
    factBoxId: factBox.react4xpId
  })
  return {
    body: factBox.renderBody({
      body
    }),
    pageContributions: factBox.renderPageContributions() as XP.PageContributions
  }
}
