const {
  getComponent,
  serviceUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/error/error')
const React4xp = require('/lib/enonic/react4xp')

const view = resolve('./kpiCalculator.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = function(req, id) {
  try {
    return renderPart(req, id)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req) {
  const kpiCalculator = new React4xp('KpiCalculator')
    .setProps({
      kpiServiceUrl: serviceUrl({
        service: 'kpi'
      })
    })
    .setId('kpiCalculatorId')
    .uniqueId()

  const body = render(view, {
    kpiCalculatorId: kpiCalculator.react4xpId
  })
  return {
    body: kpiCalculator.renderBody({
      body
    }),
    pageContributions: kpiCalculator.renderPageContributions()
  }
}
