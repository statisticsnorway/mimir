import { render, type RenderResponse } from '/lib/enonic/react4xp'
import { query, type Content, type QueryResponse } from '/lib/xp/content'
import { getContent, imageUrl, pageUrl, processHtml, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { formatDate } from '/lib/ssb/utils/dateUtils'
import type { Article } from '../../content-types/article/article'
import type { ArticleArchive } from '../../content-types/articleArchive/articleArchive'

const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

export function get(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part ', e)
  }
}

export function preview(req: XP.Request): RenderResponse {
  return renderPart(req)
}

function renderPart(req: XP.Request): RenderResponse {
  const page: Content<ArticleArchive> = getContent()
  const language: string = page.language === 'en' || page.language === 'nn' ? page.language : 'nb'
  const listOfArticlesTitle: string = localize({
    key: 'articleAnalysisPublications',
    locale: language
  })
  const title: string | undefined = page.displayName ? page.displayName : undefined

  const preamble: string | undefined = page.data.preamble ? page.data.preamble : undefined

  /* TODO: Image needs to rescale dynamically in mobile version */
  const image: string | undefined = page.data.image ? imageUrl({
    id: page.data.image,
    scale: 'block(1180, 275)'
  }) : undefined

  const imageAltText: string | undefined = page.data.image ? getImageAlt(page.data.image) : ' '
  const freeText: string | undefined = page.data.freeText ? processHtml({
    value: page.data.freeText.replace(/&nbsp;/g, ' ')
  }) : undefined

  const issnNumber: string | undefined = page.data.issnNumber ? 'ISSN ' + page.data.issnNumber : undefined

  const props: ArticleArchiveProps = {
    title,
    preamble,
    image,
    imageAltText,
    freeText,
    issnNumber,
    listOfArticlesSectionTitle: listOfArticlesTitle,
    language: language,
    pageId: page._id,
    firstArticles: parseArticleData(page._id, 0, 15, language),
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
  }

  return render('ArticleArchive', props, req, {
    body: '<section class="xp-part article-archive"></section>'
  })
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

export function parseArticleData(pageId: string, start: number, count: number, language: string): ParsedArticles {
  const articleNamePhrase: string = localize({
    key: 'articleName',
    locale: language
  })

  const articles: QueryResponse<Article, object> = query({
    start,
    count,
    sort: 'publish.from DESC',
    query: `data.articleArchive = "${pageId}"`,
    contentTypes: [
      `${app.name}:article`
    ]
  })

  const parsedArticles: Array<ParsedArticleData> = articles.hits.map((articleContent) => {
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

  return {
    articles: parsedArticles,
    total: articles.total
  }
}

interface ArticleArchiveProps {
    title: string | undefined;
    preamble: string | undefined;
    image: string | undefined;
    imageAltText: string | undefined;
    freeText: string | undefined;
    issnNumber: string | undefined;
    listOfArticlesSectionTitle: string;
    language: string;
    pageId: string;
    firstArticles: ParsedArticles;
    articleArchiveService: string;
    showMore: string;
    showMorePagination: string;
  }

interface ParsedArticleData {
  preamble: string | undefined;
  year: string | undefined;
  subtitle: string;
  href: string;
  title: string;
  date: string;
}

export interface ParsedArticles {
  articles: Array<ParsedArticleData>;
  total: number;
}


