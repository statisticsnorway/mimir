import { Article } from '../../../site/content-types/article/article'
import { Content, QueryResponse } from 'enonic-types/content'

const {
    query
  } = __non_webpack_require__('/lib/xp/content')
  const {
    pageUrl
  } = __non_webpack_require__('/lib/xp/portal')
const {
    moment
  } = __non_webpack_require__('/lib/vendor/moment')

  let totalCount: number = 0

function getChildArticles(currentPath: string, subTopicId: string, start: number, count: number, sort: string): QueryResponse<Article> {
    const toDay: string = moment().toISOString()
    return query({
      start: start,
      count: count,
      query: `(_path LIKE "/content${currentPath}*" OR data.subtopic = "${subTopicId}") AND publish.from <= instant("${toDay}")`,
      contentTypes: [`${app.name}:article`],
      sort: `publish.from ${sort}`
    })
  }

  function prepareArticles(articles: QueryResponse<Article>, language: string): Array<PreparedArticles> {
    const momentLanguage: string = language === 'en' ? 'en-gb' : 'nb'
    totalCount = articles.total
    return articles.hits.map((article: Content<Article>) => {
      return {
        title: article.displayName,
        preface: article.data.ingress ? article.data.ingress : '',
        url: pageUrl({
          id: article._id
        }),
        publishDate: article.publish && article.publish.from ? article.publish.from : '',
        publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).locale(momentLanguage).format('LL') : ''
      }
    })
  }

  interface PreparedArticles {
    title: string;
    preface: string;
    url: string;
    publishDate: string;
}