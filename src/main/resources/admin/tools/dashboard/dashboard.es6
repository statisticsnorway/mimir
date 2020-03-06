const {
    assetUrl,
    serviceUrl
} = __non_webpack_require__( '/lib/xp/portal')
const {
    getUpdated,
    getUpdatedReadable
} = __non_webpack_require__('/lib/ssb/dataset')
const {
    render
} = __non_webpack_require__( '/lib/thymeleaf')
const {
    renderError
} = __non_webpack_require__('/lib/error/error')

const content = __non_webpack_require__( '/lib/xp/content')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view = resolve('./dashboard.html')

exports.get = function(req) {
    try {
        return renderPart()
    } catch (e) {
        return renderError(req, 'Error in part', e)
    }
}

exports.preview = (req) => renderPart()

function renderPart() {
    const datasetMap = {}

    const result = content.query({
        count: 999,
        contentTypes: [`${app.name}:dataset`]
    })

    if (result && result.hits.length > 0) {
        result.hits.forEach((set) => {
            datasetMap[set.data.dataquery] = set
        })
    }

    const dataQueries = []
    const dataQueryResult = content.query({
        count: 999,
        contentTypes: [`${app.name}:dataquery`],
        sort: 'displayName'
    })
    if (dataQueryResult && dataQueryResult.hits.length > 0) {
        dataQueryResult.hits.forEach((dataquery) => {
            let updated
            let updatedHumanReadable
            const dataset = datasetMap[dataquery._id]
            const hasData = !!dataset
            if (hasData) {
                updated = getUpdated(dataset)
                updatedHumanReadable = getUpdatedReadable(dataset)
            }
            dataQueries.push({
                id: dataquery._id,
                displayName: dataquery.displayName,
                updated,
                updatedHumanReadable,
                hasData
            })
        })
    }


    const ts = new Date().getTime()

    const jsLibsUrl = assetUrl({
        path: 'js/bundle.js',
        params: {
            ts
        }
    })

    const dashboardService = serviceUrl({
        service: 'dashboard'
    })

    const stylesUrl = assetUrl({
        path: 'styles/bundle.css',
        params: {
            ts
        }
    })

    const logoUrl = assetUrl({path: 'SSB_logo.png'});

    const dashboardDataset = new React4xp('DashboardDataset')
      .setProps({
          header: 'Alle spørringer',
          dataQueries
      })
      .setId('dataset')

    const pageContributions = dashboardDataset.renderPageContributions({
        clientRender: true
    })

    const model = {
        dataQueries,
        dashboardService,
        stylesUrl,
        jsLibsUrl,
        logoUrl,
        pageContributions
    }
    let body = render(view, model)


    body = dashboardDataset.renderBody({
        body
    })


    return {
        body,
        pageContributions
    }
}
