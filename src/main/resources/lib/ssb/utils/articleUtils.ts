import { Article } from '../../../site/content-types/article/article'
import { Content, QueryResponse } from 'enonic-types/content'
import { Page } from '../../../site/content-types/page/page'

const {
  query
} = __non_webpack_require__('/lib/xp/content')
const {
  pageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

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

export function getPublications(start: number = 0, count: number = 10, language: string, articleType?: string, subject?: string): PublicationResult {
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const mainSubjects: Array<Content<Page>> = query({
    count: 500,
    contentTypes: [`${app.name}:page`],
    query: `components.page.config.mimir.default.subjectType LIKE "mainSubject" ${languageQuery}`
  }).hits as unknown as Array<Content<Page>>

  const pagePaths: Array<string> = mainSubjects.map((mainSubject) => `_parentPath LIKE "/content${mainSubject._path}/*"`)
  const subjectQuery: string = subject ? `_parentPath LIKE "/content/ssb/${subject}/*"` : `(${pagePaths.join(' OR ')})`
  const articleTypeQuery: string = articleType ? ` AND data.articleType = "${articleType}"` : ''
  const queryString: string = `${subjectQuery} ${languageQuery} ${articleTypeQuery}`

  const res: QueryResponse<Article> = query({
    start,
    count,
    query: queryString,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC'
  })

  const publications: Array<PublicationItem> = res.hits.map((article) => {
    const mainSubject: Content<Page> | undefined = mainSubjects.find((mainSubject) => {
      return article._path.startsWith(mainSubject._path)
    })
    return prepareArticle(article, mainSubject, language)
  })

  return {
    publications,
    total: res.total
  }
}

function prepareArticle(article: Content<Article>, mainSubject: Content<Page> | undefined, language: string): PublicationItem {
  return {
    title: article.displayName,
    preface: article.data.ingress ? article.data.ingress : '',
    url: pageUrl({
      id: article._id
    }),
    publishDate: article.publish && article.publish.from ? article.publish.from : '',
    publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).locale(language).format('Do MMMM YYYY') : '',
    contentType: article.type,
    articleType: article.data.articleType ? article.data.articleType : 'default',
    mainSubject: mainSubject ? mainSubject.displayName : '',
    appName: app.name
  }
}


export interface ArticleUtilsLib {
  getChildArticles: (currentPath: string, subTopicId: string, start: number, count: number, sort: string) => QueryResponse<Article>;
  prepareArticles: (articles: QueryResponse<Article>, language: string) => Array<PreparedArticles>;
  getPublications: (start: number, count: number, language: string, contentType?: string, subject?: string) => PublicationResult;
}

export interface PreparedArticles {
    title: string;
    preface: string;
    url: string;
    publishDate: string;
}

export interface PublicationResult {
  total: number;
  publications: Array<PublicationItem>;
}

export interface PublicationItem {
  title: string;
  period?: string;
  preface: string;
  url: string;
  publishDate: string;
  publishDateHuman: string;
  contentType: string;
  articleType: string;
  mainSubject: string;
  appName: string;
}
