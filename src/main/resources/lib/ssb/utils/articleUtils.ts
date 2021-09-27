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

export function getAllChildArticlesTotal(currentPath: string, subTopicId: string): number {
  const toDay: string = moment().toISOString()
  return query({
    count: 1000,
    query: `(_path LIKE "/content${currentPath}*" OR data.subtopic = "${subTopicId}") AND publish.from <= instant("${toDay}")`,
    contentTypes: [`${app.name}:article`]
  }).count
}

export function getChildArticles(currentPath: string, subTopicId: string, start: number, count: number, sort: string): QueryResponse<Article> {
  const toDay: string = moment().toISOString()
  return query({
    start: start,
    count: count,
    query: `(_path LIKE "/content${currentPath}*" OR data.subtopic = "${subTopicId}") AND publish.from <= instant("${toDay}")`,
    contentTypes: [`${app.name}:article`],
    sort: `publish.from ${sort}`
  })
}

export function prepareArticles(articles: QueryResponse<Article>, language: string): Array<PreparedArticles> {
  const momentLanguage: string = language === 'en' ? 'en-gb' : 'nb'
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
export interface ArticleUtilsLib {
  getChildArticles: (currentPath: string, subTopicId: string, start: number, count: number, sort: string) => QueryResponse<Article>;
  prepareArticles: (articles: QueryResponse<Article>, language: string) => Array<PreparedArticles>;
  getAllChildArticlesTotal: (currentPath: string, subTopicId: string) => number;
}

export interface PreparedArticles {
    title: string;
    preface: string;
    url: string;
    publishDate: string;
}
