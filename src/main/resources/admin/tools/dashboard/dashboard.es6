import { assetUrl, serviceUrl } from '/lib/xp/portal'
import { getUser, hasRole } from '/lib/xp/auth'
import { getToolUrl } from '/lib/xp/admin'
import { parseContributions, getEnvironmentString } from '/lib/ssb/utils/utils'

import { render } from '/lib/thymeleaf'
import { renderError } from '/lib/ssb/error/error'
import { React4xp } from '/lib/enonic/react4xp'

const view = resolve('./dashboard.html')
const DEFAULT_CONTENTSTUDIO_URL = getToolUrl('com.enonic.app.contentstudio', 'main')
const DEFAULT_TOOLBOX_URL = getToolUrl('systems.rcd.enonic.datatoolbox', 'data-toolbox')
const INTERNAL_BASE_URL =
  app.config && app.config['ssb.internal.baseUrl'] ? app.config['ssb.internal.baseUrl'] : 'https://i.ssb.no'
const STATREG_RAPPORT_URL =
  app.config && app.config['ssb.statregRapport.url']
    ? app.config['ssb.statregRapport.url']
    : 'https://statreg-rapport.intern.ssb.no/'
const INTERNAL_STATBANK_URL =
  app.config && app.config['ssb.statbankintern.baseUrl']
    ? app.config['ssb.statbankintern.baseUrl']
    : 'https://i.ssb.no/pxwebi/pxweb/no/prod_24v_intern/'
const ENONIC_PROJECT_ID = app.config && app.config['ssb.project.id'] ? app.config['ssb.project.id'] : 'default'

const DASHBOARD_FAG = 'dashboard.fag'

exports.get = function (req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

/**
 * @param {object} req
 * @return {{pageContributions: *, body: *}}
 */
function renderPart(req) {
  const assets = getAssets()
  const user = getUser()

  // finn ut om brukern er fag eller admin
  const userHasDashboardFagRole = hasRole(DASHBOARD_FAG)
  const userHasAdmin = hasRole('system.admin')

  const dashboardOptionsForUser = {
    dashboardTools: userHasAdmin,
    statistics: userHasDashboardFagRole || userHasAdmin,
    jobLogs: userHasAdmin,
    dataSources: userHasAdmin,
    statisticRegister: userHasAdmin,
  }

  const environmentString = getEnvironmentString()
  const dashboardDataset = new React4xp('DashboardEntry')
    .setProps({
      user,
      dashboardOptionsForUser,
      contentStudioBaseUrl: `${DEFAULT_CONTENTSTUDIO_URL}/${ENONIC_PROJECT_ID}/edit/`,
      dataToolBoxBaseUrl: `${DEFAULT_TOOLBOX_URL}#nodes?repo=no.ssb.eventlog&branch=master&path=%2Fqueries%2F`,
      internalBaseUrl: `${INTERNAL_BASE_URL}`,
      internalStatbankUrl: `${INTERNAL_STATBANK_URL}`,
      statregRapportUrl: `${STATREG_RAPPORT_URL}`,
      title: `${environmentString ? `${environmentString}: ` : ''}SSB Dashboard`,
    })
    .setId('dashboard')

  const pageContributions = parseContributions(
    dashboardDataset.renderPageContributions({
      ssr: false,
      request: req,
    })
  )

  const model = {
    ...assets,
    environmentText: environmentString ? `[${environmentString}]` : '',
    pageContributions,
    username: user.displayName,
    linkToGuide: userHasAdmin
      ? 'https://statistics-norway.atlassian.net/wiki/spaces/A600/pages/3717136497/Veiledninger+for+KOM'
      : 'https://statistics-norway.atlassian.net/wiki/spaces/PUBLISERING/overview',
  }

  let body = render(view, model)

  body = dashboardDataset.renderBody({
    body,
    ssr: false,
    request: req,
  })

  return {
    body,
    pageContributions,
  }
}

/**
 *
 * @return {{dashboardService: *, stylesUrl: *, jsLibsUrl: *, logoUrl: *}}
 */
function getAssets() {
  return {
    jsLibsUrl: assetUrl({
      path: 'js/bundle.js',
    }),
    stylesUrl: assetUrl({
      path: 'styles/bundle.css',
    }),
    logoUrl: assetUrl({
      path: 'SSB_logo_black.svg',
    }),
    wsServiceUrl: serviceUrl({
      service: 'websocket',
    }),
  }
}
