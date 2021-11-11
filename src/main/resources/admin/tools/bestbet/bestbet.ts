import { Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'

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

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: Request): React4xpResponse | Response {
  const bestbetComponent: React4xpObject = new React4xp('bestbet/Bestbet')
    .setProps({
      value: 'test',
      bestBetListServiceUrl: serviceUrl({
        service: 'bestBetList'
      }),
      model: serviceUrl({
        service: 'bestBetModel'
      }),
      logoUrl: assetUrl({
        path: 'SSB_logo_black.svg'
      })
    })
    .setId('app-bestbet')

  return {
    body: bestbetComponent.renderBody({
      body: render(view, {
        ...getAssets()
      })
    }),
    pageContributions: bestbetComponent.renderPageContributions()
  }
  // return React4xp.render('bestbet/Bestbet', {
  //   value: 'test',
  //   bestBetListServiceUrl: serviceUrl({
  //     service: 'bestBetList'
  //   }),
  //   model: serviceUrl({
  //     service: 'bestBetModel'
  //   }),
  //   logoUrl: assetUrl({
  //     path: 'SSB_logo_black.svg'
  //   }),
  //   req
  // })
}

function getAssets(): object {
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js'
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css'
    })
  }
}
