import { getChildren, query, type Content } from '/lib/xp/content'
import { attachmentUrl, getContent, pageUrl, processHtml } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'

import { data } from '/lib/util'
import { renderError } from '/lib/ssb/error/error'
import { type VariablesProps, type Variables } from '/lib/types/partTypes/variables'
import { type Article } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

const MAX_VARIABLES = 9999
const NO_VARIABLES_FOUND: XP.Response = {
  body: '',
  contentType: 'text/html',
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent()
  if (!page) throw Error('No page found')

  const language: string = page.language ? (page.language === 'en' ? 'en-gb' : page.language) : 'nb'

  const hits: Array<Content<Article>> = getChildren({
    key: page._path,
    count: MAX_VARIABLES,
  }).hits as unknown as Array<Content<Article>>

  return renderVariables(req, contentArrayToVariables(hits ? data.forceArray(hits) : [], language))
}

function renderVariables(req: XP.Request, variables: Array<Variables>): XP.Response {
  if (variables && variables.length) {
    const download: string = localize({
      key: 'variables.download',
    })

    const props: VariablesProps = {
      variables: variables.map(({ title, description, fileHref, fileModifiedDate, href }) => {
        return {
          title,
          description,
          fileLocation: fileHref,
          downloadText: download + ' (' + 'per ' + fileModifiedDate + ')',
          href,
        }
      }),
    }

    return render('Variables', props, req, {
      body: '<section class="xp-part part-variableCardsList container"/>',
      hydrate: false,
    })
  }

  return NO_VARIABLES_FOUND
}

function contentArrayToVariables(content: Array<Content<Article>>, language: string): Array<Variables> {
  return content.map((variable) => {
    const files: Array<Content<Article>> = query({
      count: 1,
      sort: 'modifiedTime DESC',
      query: `_path LIKE '/content${variable._path}/*' `,
      contentTypes: ['media:spreadsheet', 'media:document', 'media:unknown'],
    }).hits as unknown as Array<Content<Article>>

    const fileInfo: object =
      files.length > 0
        ? {
            fileHref: attachmentUrl({
              id: files[0]._id,
            }),
            fileModifiedDate: formatDate(files[0].modifiedTime, 'dd.MM.yy', language),
          }
        : {}

    return {
      title: variable.displayName,
      description: processHtml({
        value: variable.data.ingress as string,
      }),
      href: pageUrl({
        id: variable._id,
      }),
      ...fileInfo,
    }
  }) as Array<Variables>
}
