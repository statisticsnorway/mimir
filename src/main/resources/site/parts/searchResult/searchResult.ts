import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { Content } from 'enonic-types/content'
import { SearchResultPartConfig } from './searchResult-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { PreparedSearchResult, SolrPrepResultAndTotal } from '../../../lib/ssb/utils/solrUtils'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { queryNodes, getNode } from '../../../lib/ssb/repo/common'
import { NodeQueryResponse, RepoNode } from 'enonic-types/node'
import { formatDate } from '../../../lib/ssb/utils/dateUtils'
import { SEO } from '../../../services/news/news'
import { Article } from '../../content-types/article/article'

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')
const {
  get
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent,
  getContent,
  pageUrl,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')
const {
  sanitizeForSolr
} = __non_webpack_require__('/lib/ssb/utils/textUtils')
const {
  localize
} = __non_webpack_require__('/lib/xp/i18n')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  getMainSubjects
} = __non_webpack_require__( '/lib/ssb/utils/subjectUtils')

exports.get = function(req: Request): React4xpResponse | Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): React4xpResponse | Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function renderPart(req: Request): React4xpResponse {
  /* collect data */
  const content: Content = getContent()
  const part: Component<SearchResultPartConfig> = getComponent()
  const sanitizedTerm: string | undefined = req.params.sok ? sanitizeForSolr(req.params.sok) : undefined
  const searchPageUrl: string = part.config.searchResultPage ? pageUrl({
    id: part.config.searchResultPage
  }) : content._path
  const count: number = part.config.numberOfHits ? parseInt(part.config.numberOfHits) : 15
  const language: string = content.language ? content.language : 'nb'
  const phrases: {[key: string]: string} = getPhrases(content)
  const mainSubjects: Array<SubjectItem> = getMainSubjects(req, language)
  const mainSubjectDropdown: Array<Dropdown> = [
    {
      id: '',
      title: phrases['publicationArchive.allSubjects']
    }
  ].concat(mainSubjects.map((subject) => {
    return {
      id: subject.name,
      title: subject.title
    }
  }))

  function getContentTypes(solrResults: Array<string | number>): Array<Dropdown> {
    const validFilters: Array<string> = ['artikkel', 'statistikk', 'faktaside', 'statistikkbanktabell', 'publikasjon']
    const filters: Array<string | number> = solrResults
      .filter((value) => typeof value == 'string')
      .filter((value) => validFilters.includes(value as string))

    const dropdowns: Array<Dropdown> = [
      {
        id: '',
        title: phrases['publicationArchive.allTypes']
      }
    ].concat(filters.map((subject: string) => {
      return {
        id: subject,
        title: phrases[`contentType.search.${subject}`]
      }
    }))
    return dropdowns
  }

  function getBestBestPreface(bestBetData: Content<Article, object, SEO> | null): string {
    const seoDescription: string | undefined = bestBetData ? bestBetData.x['com-enonic-app-metafields']['meta-data'].seoDescription : ''

    if (bestBetData) {
      if (seoDescription) {
        return seoDescription
      }
      if (bestBetData.data && bestBetData.data.ingress) {
        return bestBetData.data.ingress
      }
    }
    return ''
  }

  function getBestBetContentType(bestBetData: Content<Article, object, SEO>| null): string {
    function isFactPage(): string {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      if (bestBetData && bestBetData.page && bestBetData.page.config && bestBetData.page.config.pageType) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        if (bestBetData.page.config.pageType === 'factPage') return 'Faktaside'
      }
      return ''
    }

    if (bestBetData) {
      switch (bestBetData.type) {
      case `${app.name}:statistics`: return 'Statistikk'
      case `${app.name}:article`: return 'Artikkel'
      case `${app.name}:page`: return isFactPage()
      default: return ''
      }
    }
    return ''
  }

  function bestBet(): PreparedSearchResult | undefined {
    const result: NodeQueryResponse = queryNodes('no.ssb.bestbet', 'master', {
      start: 0,
      count: 1,
      // query: "'data.linkedContentId' = '5ffcb5c7-53cb-4c2e-b807-11838eea549e'"
      // query: "fulltext('data.searchWords', 'jul')"
      // query: "data.searchWords LIKE '*'"
      // query: "fulltext('data.searchWords', 'fisk test jul', 'OR')"
      // query: '*'
      query: `fulltext('data.searchWords', '${sanitizedTerm}', 'OR')`
    } )
    log.info(`GLNRBN tester data igjen: ${JSON.stringify(result, null, 2)}`)

    const bet: BestBet | null = result.hits.length ? getNode('no.ssb.bestbet', 'master', result.hits[0].id) as BestBet : null
    log.info(`GLNRBN henter ut en slik node: ${JSON.stringify(bet, null, 2)}`)

    let firstBet: BestBet | null
    if (bet && bet.constructor === Array) {
      firstBet = bet[0]
    } if (bet && !(bet.constructor === Array)) {
      firstBet = bet
    } else firstBet = null

    // let bestestBet: PreparedSearchResult | null
    let bestBetResult: PreparedSearchResult | null
    if (firstBet && (firstBet.constructor !== Array)) {
      // bestestBet = {
      //   url: firstBet.data ? firstBet.data.linkedContentHref : '',
      //   contentType: 'type',
      //   mainSubject: 'subject',
      //   preface: 'en liten ingress',
      //   publishDate: '1234',
      //   publishDateHuman: 'yesteray',
      //   title: 'Yes indeed',
      //   secondaryMainSubject: 'another subject'
      // }
      const bestBetData: Content<Article, object, SEO>| null = firstBet.data ? get({
        key: firstBet.data.linkedContentId
      }) : null

      if (bestBetData) {
        bestBetResult = {
          title: bestBetData.displayName,
          preface: getBestBestPreface(bestBetData),
          contentType: getBestBetContentType(bestBetData),
          url: bestBetData._path,
          mainSubject: '',
          secondaryMainSubject: '',
          publishDate: bestBetData.publish && bestBetData.publish.from ? bestBetData.publish.from : '',
          publishDateHuman: bestBetData.publish && bestBetData.publish.from ? formatDate(bestBetData.publish.from, 'PPP', language) : ''
        }
        return bestBetResult
        // return JSON.stringify(bestestBet, null, 2)
      }
      // return ''
      return undefined
    }
    // else return ''
    return undefined
  }

  try {
    log.info(`GLNRBN tester bestbet igjen: ${JSON.stringify(bestBet(), null, 2)}`)
  } catch (error) {
    log.info('GLNRBN error: ' + error)
  }


  /* query solr */
  const solrResult: SolrPrepResultAndTotal = sanitizedTerm ?
    solrSearch( sanitizedTerm, language, parseInt(part.config.numberOfHits)) : {
      total: 0,
      hits: [],
      contentTypes: []
    }

  /* prepare props */
  // TODO: If there is a best bet, fetch only 14 items the FIRST time
  const bestBetHit: PreparedSearchResult | undefined = bestBet()
  const hits: Array<PreparedSearchResult> = bestBetHit ? [bestBetHit, ...solrResult.hits] : solrResult.hits
  const props: SearchResultProps = {
    hits,
    total: solrResult.total,
    term: sanitizedTerm ? sanitizedTerm : '',
    count,
    title: content.displayName,
    noHitMessage: localize({
      key: 'searchResult.noHitMessage',
      locale: language
    }),
    buttonTitle: localize({
      key: 'button.showMore',
      locale: language
    }),
    showingPhrase: localize({
      key: 'publicationArchive.showing',
      locale: language
    }),
    limitResultPhrase: localize({
      key: 'filter.limitResult',
      locale: language
    }),
    removeFilterPhrase: localize({
      key: 'filter.removeFilterSelection',
      locale: language
    }),
    searchServiceUrl: serviceUrl({
      service: 'freeTextSearch'
    }),
    searchPageUrl,
    language,
    dropDownSubjects: mainSubjectDropdown,
    dropDownContentTypes: getContentTypes(solrResult.contentTypes)
  }

  return React4xp.render('site/parts/searchResult/searchResultView', props, req)
}

  interface BestBet extends RepoNode {
    data: {
      linkedContentId: string;
      linkedContentTitle: string;
      linkedContentHref: string;
      searchWords: Array<string>;
    };
  }

interface SearchResultProps {
  hits: Array<PreparedSearchResult>;
  title: string;
  total: number;
  count: number;
  term: string;
  buttonTitle: string;
  noHitMessage: string;
  showingPhrase: string;
  limitResultPhrase: string;
  removeFilterPhrase: string;
  searchServiceUrl: string;
  searchPageUrl: string;
  language: string;
  dropDownSubjects: Array<Dropdown>;
  dropDownContentTypes: Array<Dropdown>;
}

interface Dropdown {
  id: string;
  title: string;
}

