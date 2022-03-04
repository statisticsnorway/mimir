import { Component } from '/lib/xp/portal'
import { Content } from '/lib/xp/content'
import { SearchResultPartConfig } from './searchResult-part-config'
import { render, RenderResponse } from '/lib/enonic/react4xp'
import { PreparedSearchResult, SolrPrepResultAndTotal } from '../../../lib/ssb/utils/solrUtils'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
import { queryNodes, getNode } from '../../../lib/ssb/repo/common'
import { NodeQueryResponse, RepoNode } from '/lib/xp/node'
import { formatDate } from '../../../lib/ssb/utils/dateUtils'

const {
  solrSearch
} = __non_webpack_require__('/lib/ssb/utils/solrUtils')
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

exports.get = function(req: XP.Request): RenderResponse | XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request): RenderResponse | XP.Response => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function renderPart(req: XP.Request): RenderResponse {
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

  function bestBet(): PreparedSearchResult | undefined {
    const result: NodeQueryResponse = queryNodes('no.ssb.bestbet', 'master', {
      start: 0,
      count: 1,
      query: `fulltext('data.searchWords', '${sanitizedTerm}', 'OR')`
    } )

    const bet: BestBet | null = result.hits.length ? getNode('no.ssb.bestbet', 'master', result.hits[0].id) as BestBet : null
    let firstBet: BestBet | null
    if (bet && bet.constructor === Array) {
      firstBet = bet[0]
    } if (bet && !(bet.constructor === Array)) {
      firstBet = bet
    } else firstBet = null

    let bestBetResult: PreparedSearchResult | null
    if (firstBet && (firstBet.constructor !== Array)) {
      bestBetResult = {
        title: firstBet.data.linkedContentTitle ? firstBet.data.linkedContentTitle : '',
        preface: firstBet.data.linkedContentIngress ? firstBet.data.linkedContentIngress : '',
        contentType: firstBet.data.linkedContentType ? firstBet.data.linkedContentType : '',
        url: firstBet.data.linkedContentHref ? firstBet.data.linkedContentHref : '',
        mainSubject: firstBet.data.linkedContentSubject ? firstBet.data.linkedContentSubject : '',
        secondaryMainSubject: '',
        publishDate: firstBet.data.linkedContentDate ? firstBet.data.linkedContentDate : '',
        publishDateHuman: firstBet.data.linkedContentDate ? formatDate(firstBet.data.linkedContentDate, 'PPP', language) : ''
      }
      return bestBetResult
    }
    return undefined
  }

  /* query solr */
  const solrResult: SolrPrepResultAndTotal = sanitizedTerm ?
    solrSearch( sanitizedTerm, language, parseInt(part.config.numberOfHits)) : {
      total: 0,
      hits: [],
      contentTypes: []
    }

  /* prepare props */
  const props: SearchResultProps = {
    bestBetHit: bestBet(),
    hits: solrResult.hits,
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
    mainSearchPhrase: localize({
      key: 'mainSearch',
      locale: language
    }),
    chooseSubjectPhrase: localize({
      key: 'dropdown.chooseSubject',
      locale: language
    }),
    chooseContentTypePhrase: localize({
      key: 'dropdown.chooseContenttype',
      locale: language
    }),
    searchPageUrl,
    language,
    dropDownSubjects: mainSubjectDropdown,
    dropDownContentTypes: getContentTypes(solrResult.contentTypes)
  }

  return render('site/parts/searchResult/searchResultView', props, req)
}

  interface BestBet extends RepoNode {
    data: {
      linkedContentId: string;
      linkedContentTitle: string;
      linkedContentHref: string;
      linkedContentIngress: string;
      linkedContentType: string;
      linkedContentDate: string;
      linkedContentSubject: string;
      searchWords: Array<string>;
    };
  }

interface SearchResultProps {
  bestBetHit: PreparedSearchResult | undefined;
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
  mainSearchPhrase: string;
  chooseSubjectPhrase: string;
  chooseContentTypePhrase: string;
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

