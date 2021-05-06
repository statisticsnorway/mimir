import { Request } from 'enonic-types/controller'
import { Article } from '../../content-types/article/article'
import { I18nLibrary } from 'enonic-types/i18n'
import { PortalLibrary, Component } from 'enonic-types/portal'
import { ArticleListPartConfig } from './articleList-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { DefaultPageConfig } from '../../pages/default/default-page-config'

const {
  localize
}: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const {
  pageUrl, getContent, getComponent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

// eslint-disable-next-line @typescript-eslint/typedef
const moment = require('moment/min/moment-with-locales')
moment.locale('nb')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const component: Component<ArticleListPartConfig> = getComponent()
  const language: string = content.language ? content.language : 'nb'
  const articles: Array<Content<Article>> = getArticles(language)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(articles)

  //  Must be set to nb instead of no for localization
  const archiveLinkText: string = localize({
    key: 'publicationLinkText',
    locale: language === 'nb' ? 'no' : language
  })
  const headerText: string = localize( {
    key: 'articleList.heading',
    locale: language === 'nb' ? 'no' : language
  })

  const props: PartProperties = {
    title: headerText,
    articles: preparedArticles,
    archiveLinkText: archiveLinkText,
    archiveLinkUrl: component.config.pubArchiveUrl ? component.config.pubArchiveUrl : '#'
  }

  return React4xp.render('site/parts/articleList/articleList', props, req)
}

function getArticles(language: string): Array<Content<Article>> {
  const pages: QueryResponse<DefaultPageConfig> = query({
    count: 500,
    contentTypes: [`${app.name}:page`],
    query: `components.page.config.mimir.default.subjectType LIKE "subSubject"`
  })
  const pagePaths: Array<string> = pages.hits.map((page) => `_parentPath LIKE "/content${page._path}/*"`)
  const languageQuery: string = language !== 'en' ? 'AND language != "en"' : 'AND language = "en"'
  const articles: Array<Content<Article>> = query({
    count: 4,
    query: `(${pagePaths.join(' OR ')}) ${languageQuery}`,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC, data.frontPagePriority DESC'
  }).hits as unknown as Array<Content<Article>>
  return articles
}

function prepareArticles(articles: Array<Content<Article>>): Array<PreparedArticles> {
  return articles.map( (article: Content<Article>) => {
    return {
      title: article.displayName,
      preface: article.data.ingress ? article.data.ingress : '',
      url: pageUrl({
        id: article._id
      }),
      publishDate: article.publish && article.publish.from ? article.publish.from : '',
      publishDateHuman: article.publish && article.publish.from ? moment(article.publish.from).format('Do MMMM YYYY') : ''
    }
  })
}

interface PreparedArticles {
  title: string;
  preface: string;
  url: string;
  publishDate: string;
}

interface PartProperties {
  title: string;
  articles: Array<PreparedArticles>;
  archiveLinkText: string;
  archiveLinkUrl: string;
}
