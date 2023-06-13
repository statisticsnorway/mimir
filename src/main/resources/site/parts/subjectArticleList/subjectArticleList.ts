import { render } from '/lib/enonic/react4xp'
import type { Content, ContentsResult } from '/lib/xp/content'
import type { PreparedArticles } from '/lib/ssb/utils/articleUtils'
import type { Article } from '/site/content-types'
import { getContent, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'

const { isEnabled } = __non_webpack_require__('/lib/featureToggle')
const { getChildArticles, prepareArticles } = __non_webpack_require__('/lib/ssb/utils/articleUtils')

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const subTopicId: string = content._id
  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = content.language ? content.language : 'nb'
  const filterAndSortEnabled: boolean = isEnabled('articlelist-sorting', false)
  const currentPath: string = content._path
  // TODO change to false when crawling of articles is fixed
  const showAllArticles = true
  const start = 0
  const count: number = showAllArticles ? 100 : 10

  const childArticles: ContentsResult<Content<Article>> = getChildArticles(currentPath, subTopicId, start, count, sort)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(childArticles, language)
  const totalArticles: number = childArticles.total

  const articleServiceUrl: string = serviceUrl({
    service: 'articles',
  })

  const headerText: string = localize({
    key: 'relatedArticlesHeading',
    locale: language === 'nb' ? 'no' : language,
  })
  const buttonText: string = localize({
    key: 'button.showMore',
    locale: language === 'nb' ? 'no' : language,
  })

  const props: PartProperties = {
    title: headerText,
    buttonTitle: buttonText,
    articleServiceUrl: articleServiceUrl,
    currentPath: currentPath,
    start: 0,
    count: count,
    showSortAndFilter: filterAndSortEnabled,
    language: language,
    articles: preparedArticles,
    totalArticles: totalArticles,
    showAllArticles: showAllArticles,
  }

  return render('site/parts/subjectArticleList/subjectArticleList', props, req)
}

interface PartProperties {
  title: string
  buttonTitle: string
  articleServiceUrl: string
  currentPath: string
  start: number
  count: number
  showSortAndFilter: boolean
  language: string
  articles: Array<PreparedArticles>
  totalArticles: number
  showAllArticles: boolean
}
