import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { React4xp, React4xpObject, React4xpPageContributionOptions, React4xpResponse } from '../../../lib/types/react4xp'
import { Request, Response } from 'enonic-types/controller'
import { Content, ContentLibrary, QueryResponse, ScheduleParams } from 'enonic-types/content'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { Article } from '../../content-types/article/article'
import { ArticleArchive } from '../../content-types/articleArchive/articleArchive'

const {
  getContent, imageUrl, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const contentLib: ContentLibrary = __non_webpack_require__('/lib/xp/content')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view: ResourceKey = resolve('./articleArchive.html')

exports.get = (req: Request): Response | React4xpResponse => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

function renderPart(req: Request):React4xpResponse {
  const page: Content<ArticleArchive> = getContent()
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const listOfArticlesTitle: string = localize({
    key: 'articleAnalysisPublications',
    locale: language
  })
  const showAllPhrase: string = localize({
    key: 'showAll',
    locale: language
  })
  const showLessPhrase: string = localize({
    key: 'showLess',
    locale: language
  })
  const articleNamePhrase: string = localize({
    key: 'articleName',
    locale: language
  })
  const title: string | undefined = page.displayName ? page.displayName : undefined

  const preambleText: string | undefined = page.data.preamble ? page.data.preamble : undefined
  const preambleObj: React4xpObject = new React4xp('LeadParagraph')
    .setProps({
      children: preambleText
    })
    .setId('preamble')

  /* TODO: Image needs to rescale dynamically in mobile version */
  const image: string | undefined = page.data.image ? imageUrl({
    id: page.data.image,
    scale: 'block(1180, 275)'
  }) : undefined

  const imageAltText: string | undefined = page.data.image ? getImageAlt(page.data.image) : ' '
  const listOfArticles: Array<ParsedArticleData> | [] = parseArticleData(page._id, articleNamePhrase, language)
  const listOfArticlesObj: React4xpObject = new React4xp('ListOfArticles')
    .setProps({
      listOfArticlesSectionTitle: listOfArticlesTitle,
      articles: listOfArticles.map((article) => {
        return {
          ...article
        }
      }),
      showAll: showAllPhrase,
      showLess: showLessPhrase
    })
    .setId('listOfArticles')

  const freeText: string | undefined = page.data.freeText ? processHtml({
    value: page.data.freeText.replace(/&nbsp;/g, ' ')
  }) : undefined

  const issnNumber: string | undefined = page.data.issnNumber ? 'ISSN ' + page.data.issnNumber : undefined

  const model: ThymeleafModel = {
    title,
    image,
    imageAltText,
    freeText,
    issnNumber
  }

  const preambleBody: string = preambleObj.renderBody({
    body: render(view, model)
  })

  const finalBody: string = listOfArticlesObj.renderBody({
    body: preambleBody
  })

  const finalPagePageContributions: string = listOfArticlesObj.renderPageContributions() as string

  return {
    body: finalBody,
    pageContributions: finalPagePageContributions
  }
}

function parseArticleData(pageId: string, articleNamePhrase: string, language: string): Array<ParsedArticleData> | [] {
  const articlesWithArticleArchivesSelected: QueryResponse<Article> = contentLib.query({
    count: 9999,
    sort: 'publish.from DESC',
    query: `data.articleArchive = "${pageId}"`,
    contentTypes: [
      `${app.name}:article`
    ]
  })

  if (!articlesWithArticleArchivesSelected || !(articlesWithArticleArchivesSelected.hits.length > 0)) {
    return []
  }

  return articlesWithArticleArchivesSelected.hits.map((articleContent) => {
    return {
      year: getYear(articleContent.publish, articleContent.createdTime, language),
      subtitle: getSubTitle(articleContent, articleNamePhrase, language),
      href: pageUrl({
        id: articleContent._id
      }),
      title: articleContent.displayName,
      preamble: articleContent.data.ingress
    }
  })
}

function getYear(
  publish: ScheduleParams |undefined,
  createdTime: string,
  language: string): string | undefined {
  return publish && createdTime ?
    formatDate(publish.from, 'yyyy', language) :
    formatDate(createdTime, 'yyyy', language)
}

function getSubTitle(articleContent: Content<Article>, articleNamePhrase: string, language: string): string {
  let type: string = ''
  if (articleContent.type === `${app.name}:article`) {
    type = articleNamePhrase
  }

  let prettyDate: string | undefined = ''
  if (articleContent.publish && articleContent.publish.from) {
    prettyDate = formatDate(articleContent.publish.from, 'PPP', language)
  } else {
    prettyDate = formatDate(articleContent.createdTime, 'PPP', language)
  }

  return `${type ? `${type} / ` : ''}${prettyDate ? prettyDate : ''}`
}

interface ParsedArticleData {
  preamble: string | undefined;
  year: string | undefined;
  subtitle: string;
  href: string;
  title: string
}

interface ThymeleafModel {
  title: string | undefined;
  image: string | undefined;
  imageAltText: string | undefined;
  freeText: string | undefined;
  issnNumber: string | undefined;
}


