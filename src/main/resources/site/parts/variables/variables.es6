const {
  data
} = __non_webpack_require__('/lib/util')
const {
  attachmentUrl,
  getContent,
  pageUrl,
  processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const contentLib = __non_webpack_require__('/lib/xp/content')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const moment = require('moment/min/moment-with-locales')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view = resolve('./variables.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

const MAX_VARIABLES = 9999
const NO_VARIABLES_FOUND = {
  body: '',
  contentType: 'text/html'
}

const renderPart = (req) => {
  moment.locale('nb')

  const children = contentLib.getChildren({
    key: getContent()._path,
    count: MAX_VARIABLES
  })

  return renderVariables(contentArrayToVariables(children.hits ? data.forceArray(children.hits) : []))
}

/**
 *
 * @param {Array} variables
 * @return {{ body: string, pageContributions: string, contentType: string }}
 */
const renderVariables = (variables) => {
  if (variables && variables.length) {
    const download = i18nLib.localize({
      key: 'variables.download'
    })

    const variablesXP = new React4xp('variables/Variables')
      .setProps({
        variables: variables.map(({
          title, description, fileHref, fileModifiedDate, href
        }) => {
          return {
            title,
            description,
            fileLocation: fileHref,
            downloadText: download + ' (' + 'per ' + fileModifiedDate + ')',
            href
          }
        })
      })
      .uniqueId()

    const body = render(view, {
      variablesListId: variablesXP.react4xpId
    })

    return {
      body: variablesXP.renderBody({
        body
      }),
      pageContributions: variablesXP.renderPageContributions(),
      contentType: 'text/html'
    }
  }

  return NO_VARIABLES_FOUND
}

/**
 *
 * @param {Array} content
 * @return {array}
 */
const contentArrayToVariables = (content) => {
  return content.map((variable) => {
    const files = contentLib.query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${variable._path}/*' `,
      contentTypes: [
        'media:spreadsheet',
        'media:document',
        'media:unknown'
      ]
    })

    const fileInfo = (files.hits.length > 0) ? {
      fileHref: attachmentUrl({
        id: files.hits[0]._id
      }),
      fileModifiedDate: moment(files.hits[0].modifiedTime).format('DD.MM.YY')
    } : {}

    return {
      title: variable.displayName,
      description: processHtml({
        value: variable.data.ingress
      }),
      href: pageUrl({
        id: variable._id
      }),
      ...fileInfo
    }
  })
}
