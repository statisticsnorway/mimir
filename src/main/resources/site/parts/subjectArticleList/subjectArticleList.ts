import { type Content, type ContentsResult } from '/lib/xp/content'
import { getContent, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { getChildArticles, getArticlesMainsubject, prepareArticles } from '/lib/ssb/utils/articleUtils'
import { getSubSubjects, getSubSubjectsByPath } from '/lib/ssb/utils/subjectUtils'
import { render } from '/lib/enonic/react4xp'

import { isEnabled } from '/lib/featureToggle'
import { type SubjectArticleListProps } from '/lib/types/partTypes/subjectArticleList'
import { type PreparedArticles } from '/lib/types/article'
import { type SubjectItem } from '/lib/types/subject'
import { type Article } from '/site/content-types'

export function get(req: XP.Request) {
  return renderPart(req)
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const content = getContent()
  if (!content) throw Error('No page found')

  const pageConfig = content.page?.config
  const subjectType = pageConfig ? pageConfig.subjectType : ''
  const subTopicId: string = content._id
  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = content.language ? content.language : 'nb'
  const allSubSubjects: SubjectItem[] = subjectType === 'mainSubject' ? getSubSubjects(req, language) : []
  const filterAndSortEnabled: boolean = isEnabled('articlelist-sorting', false)
  const currentPath: string = content._path
  const subSubjectByPath = getSubSubjectsByPath(allSubSubjects, currentPath)
  // TODO change to false when crawling of articles is fixed
  const showAllArticles = true
  const start = 0
  const count: number = showAllArticles ? 100 : 10

  const childArticles: ContentsResult<Content<Article>> =
    subjectType === 'mainSubject'
      ? getArticlesMainsubject(currentPath, subSubjectByPath, subTopicId, start, count, sort)
      : getChildArticles(currentPath, subTopicId, start, count, sort)
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

  const props: SubjectArticleListProps = {
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
