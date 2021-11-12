import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { RepoNode } from 'enonic-types/node'


const {
  assetUrl, serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const view: ResourceKey = resolve('./bestbet.html')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  listBestBets,
  createBestBet
} = __non_webpack_require__('/lib/ssb/repo/bestbet')
const {
  ensureArray
} = __non_webpack_require__('/lib/ssb/utils/arrayUtils')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}
exports.post = function(req: Request): React4xpResponse | Response {
  const body: Bestbet = JSON.parse(req.body)
  // eslint-disable-next-line @typescript-eslint/typedef
  const response = createBestBet(body.linkedContentId, body.searchWords)
  log.info(JSON.stringify(response, null, 2))
  return renderPart(req)
}


exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request): React4xpResponse | Response {
  const bestbets: Array<Bestbet> = ensureArray(listBestBets(100))
  let payload: Payload | undefined
  if (bestbets) {
    payload = {
      body: {
      // total: bestbets.total,
        count: bestbets.length,
        hits: bestbets.map((bet) => ({
          id: bet._id,
          linkedContentId: bet.linkedContentId,
          searchWords: bet.searchWords
        })
        )
      }
    }
  }
  const bestbetComponent: React4xpObject = new React4xp('bestbet/Bestbet')
    .setProps({
      value: 'test',
      bestBetList: payload,
      model: serviceUrl({
        service: 'bestBetModel'
      }),
      logoUrl: assetUrl({
        path: 'SSB_logo_black.svg'
      })
    })
    .setId('app-bestbet')

  const pageContributions: PageContributions = parseContributions(bestbetComponent.renderPageContributions() as PageContributions)

  return {
    body: bestbetComponent.renderBody({
      body: render(view, {
        ...getAssets(),
        pageContributions
      })
    }),
    pageContributions
  }
}

function getAssets(): object {
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js'
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css'
    }),
    wsServiceUrl: serviceUrl({
      service: 'websocket'
    })
  }
}

function parseContributions(contributions: PageContributions): PageContributions {
  contributions.bodyEnd = contributions.bodyEnd && (contributions.bodyEnd as Array<string>).map((script: string) => script.replace(' defer>', ' defer="">'))
  return contributions
}


interface Payload {
  body: {
    count: number;
    hits: Array<Bestbet>;
  };
}
interface Bestbet {
  _id?: string;
  id?: string;
  linkedContentId: string;
  searchWords: Array<string>;
}
