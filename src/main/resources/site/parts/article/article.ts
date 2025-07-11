import { type Content } from '/lib/xp/content'
import { processHtml, getContent } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import { scriptAsset } from '/lib/ssb/utils/utils'
import { getAssociatedStatisticsLinks, getAssociatedArticleArchiveLinks } from '/lib/ssb/utils/articleUtils'

import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { type ArticleProps } from '/lib/types/partTypes/article'
import { type Article } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: XP.Request) {
  const page = getContent<Content<Article>>()
  if (!page) throw Error('No page found')

  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const phrases = getPhrases(page)!

  const bodyText: string | undefined = page.data.articleText
    ? processHtml({
        value: page.data.articleText.replace(/&nbsp;/g, ' '),
      })
    : undefined

  const pubDate: string | undefined = formatDate(page.publish?.from, 'PPP', language)
  const showModifiedDate: Article['showModifiedDate'] = page.data.showModifiedDate
  let modifiedDate: string | undefined
  let modifiedDateIso: string | undefined
  if (showModifiedDate?.dateOption?.modifiedDate) {
    const dateFormat = showModifiedDate.dateOption?.showModifiedTime ? 'PPp' : 'PPP'
    modifiedDate = formatDate(showModifiedDate.dateOption?.modifiedDate, dateFormat, language)
    modifiedDateIso = new Date(showModifiedDate.dateOption.modifiedDate).toISOString()
  }

  const authorConfig: Article['authorItemSet'] = page.data.authorItemSet
    ? util.data.forceArray(page.data.authorItemSet)
    : []
  const authors: Article['authorItemSet'] | undefined = authorConfig.length
    ? authorConfig.map(({ name, email }) => {
        return {
          name,
          email,
        }
      })
    : undefined

  const associatedStatisticsConfig: Article['associatedStatistics'] = page.data.associatedStatistics
    ? util.data.forceArray(page.data.associatedStatistics)
    : []

  const associatedArticleArchivesConfig: Article['articleArchive'] = page.data.articleArchive
    ? util.data.forceArray(page.data.articleArchive)
    : []

  const props: ArticleProps = {
    phrases,
    introTitle: page.data.introTitle,
    title: page.displayName,
    preface: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    modifiedDateIso,
    authors,
    serialNumber: page.data.serialNumber,
    associatedStatistics: getAssociatedStatisticsLinks(associatedStatisticsConfig),
    associatedArticleArchives: getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig),
    isbn: page.data.isbnNumber,
  }

  return render('site/parts/article/article', props, req, {
    pageContributions: {
      bodyEnd: [scriptAsset('js/divider.js')],
    },
    hydrate: false,
  })
}
