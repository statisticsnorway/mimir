import { Content } from 'enonic-types/content'
import { PageContributions, Request, Response } from 'enonic-types/controller'
import { ResourceKey, render } from 'enonic-types/thymeleaf'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'
import { Article } from '../../content-types/article/article'

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
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const contentLib = __non_webpack_require__('/lib/xp/content')
const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

const view: ResourceKey = resolve('./variables.html')

exports.get = function(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): Response => renderPart(req)

const MAX_VARIABLES: number = 9999
const NO_VARIABLES_FOUND: Response = {
  body: '',
  contentType: 'text/html'
}

function renderPart(req: Request): Response {
  const page: Content = getContent()
  const language: string = page.language ? page.language === 'en' ? 'en-gb' : page.language : 'nb'

  const hits: Array<Content<Article>> = contentLib.getChildren({
    key: page._path,
    count: MAX_VARIABLES
  }).hits as unknown as Array<Content<Article>>

  return renderVariables(contentArrayToVariables(hits ? data.forceArray(hits) : [], language))
}

function renderVariables(variables: Array<Variables>): Response {
  if (variables && variables.length) {
    const download: string = i18nLib.localize({
      key: 'variables.download'
    })

    const variablesXP: React4xpObject = new React4xp('variables/Variables')
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

    const body: string = render(view, {
      variablesListId: variablesXP.react4xpId
    })

    return {
      body: variablesXP.renderBody({
        body
      }),
      pageContributions: variablesXP.renderPageContributions() as PageContributions,
      contentType: 'text/html'
    }
  }

  return NO_VARIABLES_FOUND
}

function contentArrayToVariables(content: Array<Content<Article>>, language: string): Array<Variables> {
  return content.map((variable) => {
    const files: Array<Content<Article>> = contentLib.query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${variable._path}/*' `,
      contentTypes: [
        'media:spreadsheet',
        'media:document',
        'media:unknown'
      ]
    }).hits as unknown as Array<Content<Article>>

    const fileInfo: object = (files.length > 0) ? {
      fileHref: attachmentUrl({
        id: files[0]._id
      }),
      fileModifiedDate: moment(files[0].modifiedTime).locale(language).format('DD.MM.YY')
    } : {}

    return {
      title: variable.displayName,
      description: processHtml({
        value: variable.data.ingress as string
      }),
      href: pageUrl({
        id: variable._id
      }),
      ...fileInfo
    }
  }) as Array<Variables>
}

interface Variables {
  title: string;
  description: string;
  href: string;
  fileHref: string;
  fileModifiedDate: string;
}
