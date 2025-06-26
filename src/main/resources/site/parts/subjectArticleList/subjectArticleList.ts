import { type Content, type ContentsResult } from '/lib/xp/content'
import { getContent, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { getChildArticles, getSubtopics, prepareArticles } from '/lib/ssb/utils/articleUtils'
import { render } from '/lib/enonic/react4xp'
import { isEnabled } from '/lib/featureToggle'
import { type SubjectArticleListProps } from '/lib/types/partTypes/subjectArticleList'
import { type PreparedArticles } from '/lib/types/article'
import { type Article, type Page } from '/site/content-types'

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent<Content<Page>>()
  if (!content) throw Error('No page found')

  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = content.language ? content.language : 'nb'
  const filterAndSortEnabled: boolean = isEnabled('articlelist-sorting', false)
  const currentPath: string = content._path

  const start = 0
  const count: number = 10

  const subTopicIds: string | string[] = getSubtopics(content, currentPath, req, language)
  const childArticles: ContentsResult<Content<Article>> = getChildArticles(currentPath, subTopicIds, start, count, sort)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(childArticles, language)
  const totalArticles: number = childArticles.total

  const articleServiceUrl: string = serviceUrl({
    service: 'articles',
  })

  const headerText: string = localize({
    key: 'relatedArticlesHeading',
    locale: language === 'nb' ? 'no' : language,
  })
  const showMore: string = localize({
    key: 'button.showMore',
    locale: language === 'nb' ? 'no' : language,
  })
  const showLess: string = localize({
    key: 'showLess',
    locale: language === 'nb' ? 'no' : language,
  })
  const showCount: string = localize({
    key: 'publicationArchive.showing',
    locale: language === 'nb' ? 'no' : language,
  })

  const props: SubjectArticleListProps = {
    title: headerText,
    showMore,
    showLess,
    showCount,
    articleServiceUrl: articleServiceUrl,
    currentPath: currentPath,
    start: 0,
    count: count,
    showSortAndFilter: filterAndSortEnabled,
    language: language,
    articles: preparedArticles,
    totalArticles,
  }

  return render('site/parts/subjectArticleList/subjectArticleList', props, req)
}
