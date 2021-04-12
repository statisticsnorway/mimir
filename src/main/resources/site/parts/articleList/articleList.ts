import { Request, Response } from 'enonic-types/controller'
import { Content, ContentLibrary, QueryResponse } from 'enonic-types/content'
import { Article } from '../../content-types/article/article'
import { ArticleListPartConfig } from './articleList-part-config'
import { PortalLibrary, Component } from 'enonic-types/portal'
import { React4xp, React4xpObject } from '../../../lib/types/react4xp'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
// eslint-disable-next-line @typescript-eslint/typedef
const moment = require('moment/min/moment-with-locales')
moment.locale('nb')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')

const {
  query
}: ContentLibrary = __non_webpack_require__('/lib/xp/content')

const {
  pageUrl, getContent, getComponent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')

exports.get = (req: Request): Response => {
  return renderPart(req)
}

exports.preview = (req: Request): Response => renderPart(req)

function renderPart(req: Request): Response {
  const content: Content = getContent()
  const component: Component<ArticleListPartConfig> = getComponent()
  const language: string = content.language ? content.language : 'nb'
  const articles: QueryResponse<Article> = getArticles(language)
  const preparedArticles: Array<PreparedArticles> = prepareArticles(articles)

  //  Must be set to nb instead of no for localization
  const archiveLinkText: string = localize({
    key: 'publicationLinkText',
    locale: language === 'nb' ? 'no' : language
  })
  log.info('glnrbn språk: ' + archiveLinkText)

  const props: PartProperties = {
    title: 'Nye artikler, analyser og publikasjoner',
    articles: preparedArticles,
    archiveLinkText: archiveLinkText,
    archiveLinkUrl: component.config.pubArchiveUrl
  }
  log.info(JSON.stringify(props, null, 2))

  const reactComponent: React4xpObject = new React4xp('ArticleList')
    .setProps(props)
    .setId('articleList')
    .uniqueId()

  return {
    body: reactComponent.renderBody({
      body: `<div data-th-id="${reactComponent.react4xpId}"></div>`
    })

  }
}
// TODO: Url til artikkelarkiv nederst

function getArticles(language: string): QueryResponse<Article> {
  const q: QueryResponse<Article> = query({
    count: 4,
    query: ``,
    contentTypes: [`${app.name}:article`],
    sort: 'publish.from DESC',
    filters: {
      boolean: {
        must: [
          {
            exists: {
              field: 'data.showOnFrontPage'
            }
          },
          {
            hasValue: {
              field: 'data.showOnFrontPage',
              values: [
                true
              ]
            }
          },
          {
            hasValue: {
              field: 'language',
              values: [
                language
              ]
            }
          }
        ]
      }
    }
  })
  log.info(JSON.stringify(q, null, 2))
  return q
}

function prepareArticles(articles: QueryResponse<Article>): Array<PreparedArticles> {
  return articles.hits.map( (article: Content<Article>) => {
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
