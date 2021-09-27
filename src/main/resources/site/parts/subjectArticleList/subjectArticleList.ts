import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PreparedArticles } from '../../../lib/ssb/utils/articleUtils'

const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  getContent, serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')
const {
  getChildArticles,
  prepareArticles,
  getAllChildArticlesTotal
} = __non_webpack_require__( '/lib/ssb/utils/articleUtils')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const subTopicId: string = content._id
  const sort: string = req.params.sort ? req.params.sort : 'DESC'
  const language: string = content.language ? content.language : 'nb'
  const filterAndSortEnabled: boolean = isEnabled('articlelist-sorting', false)
  const currentPath: string = content._path
  // TODO change to false when crawling of articles is fixed
  const showAllArticles: boolean = true
  const start: number = 0
  const count: number = showAllArticles ? 100 : 10

  const preparedArticles: Array<PreparedArticles> = prepareArticles(getChildArticles(currentPath, subTopicId, start, count, sort), language)
  const totalArticles: number = getAllChildArticlesTotal(currentPath, subTopicId)

  const articleServiceUrl: string = serviceUrl({
    service: 'articles'
  })

  const headerText: string = localize({
    key: 'relatedArticlesHeading',
    locale: language === 'nb' ? 'no' : language
  })
  const buttonText: string = localize({
    key: 'button.showMore',
    locale: language === 'nb' ? 'no' : language
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
    showAllArticles: showAllArticles
  }

  return React4xp.render('site/parts/subjectArticleList/subjectArticleList', props, req)
}

interface PartProperties {
    title: string;
    buttonTitle: string;
    articleServiceUrl: string;
    currentPath: string;
    start: number;
    count: number;
    showSortAndFilter: boolean;
    language: string;
    articles: Array<PreparedArticles>;
    totalArticles: number;
    showAllArticles: boolean;

}
