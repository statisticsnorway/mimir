import { Request, Response } from 'enonic-types/controller'
import { Component } from 'enonic-types/portal'
import { Content } from 'enonic-types/content'
import { SearchResultPartConfig } from './searchResult-part-config'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { PreparedSearchResult, SolrPrepResultAndTotal } from '../../../lib/ssb/utils/solrUtils'
import { SubjectItem } from '../../../lib/ssb/utils/subjectUtils'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
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

  /* query solr */
  const solrResult: SolrPrepResultAndTotal = sanitizedTerm ?
    solrSearch( sanitizedTerm, language, parseInt(part.config.numberOfHits)) : {
      total: 0,
      hits: []
    }

  /* prepare props */
  const props: ReactProps = {
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
    searchServiceUrl: serviceUrl({
      service: 'freeTextSearch'
    }),
    searchPageUrl,
    language,
    dropDownSubjects: mainSubjectDropdown
  }

  return React4xp.render('site/parts/searchResult/searchResultView', props, req)
}


interface ReactProps {
  hits: Array<PreparedSearchResult>;
  title: string;
  total: number;
  count: number;
  term: string;
  buttonTitle: string;
  noHitMessage: string;
  showingPhrase: string;
  searchServiceUrl: string;
  searchPageUrl: string;
  language: string;
  dropDownSubjects: Array<Dropdown>;
}

interface Dropdown {
  id: string;
  title: string;
}

