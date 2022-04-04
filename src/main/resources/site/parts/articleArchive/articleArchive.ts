import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { Request, Response } from 'enonic-types/controller'
import { Content, QueryResponse, ScheduleParams } from 'enonic-types/content'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { Article } from '../../content-types/article/article'
import { ArticleArchive } from '../../content-types/articleArchive/articleArchive'

const {
  getContent, imageUrl, pageUrl, processHtml, serviceUrl
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
  const listOfArticlesObj: React4xpObject = new React4xp('ArticleArchive')
    .setProps({
      listOfArticlesSectionTitle: listOfArticlesTitle,
      language: language,
      pageId: page._id,
      articleArchiveService: serviceUrl({
        service: 'articleArchive'
      }),
      showMore: localize({
        key: 'button.showMore',
        locale: language
      }),
      showMorePagination: localize({
        key: 'articleArchive.showMore',
        locale: language
      })
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

  const finalPagePageContributions: string = listOfArticlesObj.renderPageContributions()

  return {
    body: finalBody,
    pageContributions: finalPagePageContributions
  }
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

export function parseArticleData(articles: QueryResponse<Article>, language: string): Array<ParsedArticleData> | [] {
  const articleNamePhrase: string = localize({
    key: 'articleName',
    locale: language
  })

  return articles.hits.map((articleContent) => {
    return {
      year: articleContent.publish && articleContent.createdTime ?
        formatDate(articleContent.publish.from, 'yyyy', language) :
        formatDate(articleContent.createdTime, 'yyyy', language),
      subtitle: getSubTitle(articleContent, articleNamePhrase, language),
      href: pageUrl({
        id: articleContent._id
      }),
      title: articleContent.displayName,
      preamble: articleContent.data.ingress,
      date: articleContent.publish && articleContent.publish.from ? articleContent.publish.from : ''
    }
  })
}

interface ThymeleafModel {
  title: string | undefined;
  image: string | undefined;
  imageAltText: string | undefined;
  freeText: string | undefined;
  issnNumber: string | undefined;
}

export interface ParsedArticleData {
  preamble: string | undefined;
  year: string | undefined;
  subtitle: string;
  href: string;
  title: string;
  date: string;
}


