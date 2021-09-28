import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Article } from '../../content-types/article/article'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getContent, pageUrl, processHtml
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  moment
} = __non_webpack_require__('/lib/vendor/moment')

exports.get = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part: ', e)
  }
}

function renderPart(req: Request): React4xpResponse {
  const page: Content<Article> = getContent()
  const language: string = page.language ? (page.language === 'en' ? 'en-gb' : page.language) : 'nb'
  const phrases: object = getPhrases(page)

  const bodyText: string | undefined = page.data.articleText ? processHtml({
    value: page.data.articleText.replace(/&nbsp;/g, ' ')
  }) : undefined

  const pubDate: string = moment(page.publish?.from).locale(language).format('LL')
  const showModifiedDate: Article['showModifiedDate'] = page.data.showModifiedDate
  let modifiedDate: string | undefined = undefined
  if (showModifiedDate) {
    modifiedDate = moment(showModifiedDate.dateOption?.modifiedDate).locale(language).format('LL')
    if (showModifiedDate.dateOption?.showModifiedTime) {
      modifiedDate = moment(page.data.showModifiedDate?.dateOption?.modifiedDate).locale(language).format('LLL')
    }
  }

  const authorConfig: Article['authorItemSet'] = page.data.authorItemSet ? forceArray(page.data.authorItemSet) : []
  const authors: Article['authorItemSet'] | undefined = authorConfig.length ? authorConfig.map(({
    name, email
  }) => {
    return {
      name,
      email
    }
  }) : undefined

  const associatedStatisticsConfig: Article['associatedStatistics'] =
  page.data.associatedStatistics ? forceArray(page.data.associatedStatistics) : []

  const associatedArticleArchivesConfig: Article['articleArchive'] = page.data.articleArchive ? forceArray(page.data.articleArchive) : []

  const props: ArticleProps = {
    phrases,
    introTitle: page.data.introTitle,
    title: page.displayName,
    ingress: page.data.ingress,
    bodyText,
    showPubDate: page.data.showPublishDate,
    pubDate,
    modifiedDate,
    authors,
    serialNumber: page.data.serialNumber,
    associatedStatistics: getAssociatedStatisticsLinks(associatedStatisticsConfig),
    associatedArticleArchives: getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig),
    isbn: isEnabled('article-isbn', true) && page.data.isbnNumber,
  }

  return React4xp.render('site/parts/article/article', props, req)
}

function getAssociatedStatisticsLinks(associatedStatisticsConfig: Article['associatedStatistics']): Array<AssociatedLink> | [] {
  if (associatedStatisticsConfig && associatedStatisticsConfig.length) {
    return associatedStatisticsConfig.map((option) => {
      if (option?._selected === 'XP') {
        const associatedStatisticsXP: string | undefined = option.XP?.content
        const associatedStatisticsXPContent: Content | null = associatedStatisticsXP ? get({
          key: associatedStatisticsXP
        }) : null

        if (associatedStatisticsXPContent) {
          return {
            text: associatedStatisticsXPContent.displayName,
            href: associatedStatisticsXP ? pageUrl({
              path: associatedStatisticsXPContent._path
            }) : ''
          }
        }
      } else if (option?._selected === 'CMS') {
        const associatedStatisticsCMS: CMS | undefined = option.CMS

        return {
          text: associatedStatisticsCMS?.title,
          href: associatedStatisticsCMS?.href
        }
      }
      return
    }).filter((statistics) => !!statistics) as Array<AssociatedLink>
  }
  return []
}

function getAssociatedArticleArchiveLinks(associatedArticleArchivesConfig: Article['articleArchive']): Array<AssociatedLink> | [] {
  if (associatedArticleArchivesConfig && associatedArticleArchivesConfig.length) {
    return associatedArticleArchivesConfig.map((articleArchive: string) => {
      const articleArchiveContent: Content | null = articleArchive ? get({
        key: articleArchive
      }) : null

      if (articleArchiveContent) {
        return {
          text: articleArchiveContent.displayName,
          href: articleArchive ? pageUrl({
            path: articleArchiveContent._path
          }) : ''
        }
      }
      return
    }).filter((articleArchive) => !!articleArchive) as Array<AssociatedLink>
  }
  return []
}

interface AssociatedLink {
  text: string | undefined;
  href: string | undefined;
}

interface CMS {
  href?: string | undefined;
  title?: string | undefined;
}

interface ArticleProps {
  phrases: object;
  introTitle: string | undefined;
  title: string;
  ingress: string | undefined;
  bodyText: string | undefined;
  showPubDate: boolean;
  pubDate: string | undefined;
  modifiedDate: string | undefined;
  authors: Article['authorItemSet'] | undefined;
  serialNumber: string | undefined;
  associatedStatistics: Array<AssociatedLink> | [];
  associatedArticleArchives: Array<AssociatedLink> | [];
  isbn: string | undefined;
}
