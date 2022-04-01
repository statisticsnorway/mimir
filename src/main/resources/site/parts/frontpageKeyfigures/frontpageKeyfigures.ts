import {ResourceKey} from "enonic-types/thymeleaf";
import {Request, Response} from "enonic-types/controller";
import {React4xpObject, React4xpResponse} from "../../../lib/types/react4xp";
import {Component} from "enonic-types/portal";
import {FrontpageKeyfiguresPartConfig} from "./frontpageKeyfigures-part-config";
import {Content} from "enonic-types/content";
import {KeyFigure} from "../../content-types/keyFigure/keyFigure";
import {KeyFigureView} from "../../../lib/ssb/parts/keyFigure";

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  data
} = __non_webpack_require__('/lib/util')
const {
  parseKeyFigure
} = __non_webpack_require__('/lib/ssb/parts/keyFigure')
const {
  DATASET_BRANCH
} = __non_webpack_require__('/lib/ssb/repo/dataset')

const view: ResourceKey = resolve('./frontpageKeyfigures.html')

exports.get = function(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

const isKeyfigureData = (data: FrontPageKeyFigureData | undefined): data is FrontPageKeyFigureData => {
  return !!data
} // user-defined type guards <3

function renderPart(req: Request): Response | React4xpResponse {
  const part: Component<FrontpageKeyfiguresPartConfig> = getComponent()
  const keyFiguresPart: Array<FrontpageKeyfigure> = part.config.keyfiguresFrontpage ? data.forceArray(part.config.keyfiguresFrontpage) : []

  const frontpageKeyfigures: Array<FrontPageKeyFigureData | undefined> = keyFiguresPart.map((keyFigure: FrontpageKeyfigure) => {
    const keyFigureContent: Content<KeyFigure> | null = keyFigure.keyfigure ? get({
      key: keyFigure.keyfigure
    }) : null

    if (keyFigureContent) {
      const keyFigureData: KeyFigureView = parseKeyFigure(keyFigureContent, undefined, DATASET_BRANCH)
      return {
        id: keyFigureContent._id,
        title: keyFigureData.title,
        urlText: keyFigure.urlText,
        url: keyFigure.url,
        number: keyFigureData.number,
        numberDescription: keyFigureData.numberDescription,
        noNumberText: keyFigureData.noNumberText
      }
    } else return undefined
  })

  const frontPagefiguresCleaned: Array<FrontPageKeyFigureData> = frontpageKeyfigures.filter(isKeyfigureData)

  return frontpageKeyfigures && frontpageKeyfigures.length > 0 ? renderFrontpageKeyfigures(req, frontPagefiguresCleaned) : {
    body: '',
    contentType: 'text/html'
  }
}

function renderFrontpageKeyfigures(req: Request, frontpageKeyfigures: Array<FrontPageKeyFigureData> ): React4xpResponse {
  const frontpageKeyfiguresReact: React4xpObject = new React4xp('FrontpageKeyfigures')
    .setProps({
      keyFigures: frontpageKeyfigures.map((frontpageKeyfigure) => {
        return {
          ...frontpageKeyfigure
        }
      })
    })
    .uniqueId()

  const body: string = render(view, {
    frontpageKeyfiguresId: frontpageKeyfiguresReact.react4xpId
  })

  return {
    body: frontpageKeyfiguresReact.renderBody({
      body,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: frontpageKeyfiguresReact.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}

interface FrontpageKeyfigure {
  keyfigure?: string;
  urlText: string;
  url: string;
}

interface FrontPageKeyFigureData {
  id: string;
  title: string;
  urlText: string;
  url: string;
  number?: string;
  numberDescription?: string;
  noNumberText:string;
}
