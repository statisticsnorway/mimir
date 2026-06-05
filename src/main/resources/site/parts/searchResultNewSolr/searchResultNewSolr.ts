import { type Request, type Response } from '@enonic-types/core'
import { getContent, getComponent, pageUrl, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { getNameSearchResult } from '/lib/ssb/utils/nameSearchUtils'
import { type SolrResponse, type SolrPrepResultAndTotal } from '/lib/types/solr'

import { renderError } from '/lib/ssb/error/error'
import { sanitizeForSolr } from '/lib/ssb/utils/textUtils'
import { NameSearchData, type ContentTypePhrase, type SearchResultProps } from '/lib/types/partTypes/searchResult'
import { solrTestNewSearch } from '/lib/ssb/utils/solrUtils'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request) {
  return renderPart(req)
}

export function renderPart(req: Request) {
  /* collect data */
  const content = getContent()
  if (!content) throw Error('No page found')

  const part = getComponent<XP.PartComponent.SearchResult>()
  if (!part) throw Error('No part found')

  const sanitizedTerm: string = req.params.sok ? sanitizeForSolr(req.params.sok.toString()) : ''
  const searchPageUrl: string = part.config.searchResultPage
    ? pageUrl({
        id: part.config.searchResultPage,
      })
    : content._path
  const count: number = part.config.numberOfHits ? parseInt(part.config.numberOfHits) : 15
  const language: string = content.language ? content.language : 'nb'

  const contentTypePhrases: Array<ContentTypePhrase> = [
    {
      id: 'artikkel',
      title: localize({
        key: 'contentType.search.artikkel',
        locale: language,
      }),
    },
    {
      id: 'statistikk',
      title: localize({
        key: 'contentType.search.statistikk',
        locale: language,
      }),
    },
    {
      id: 'faktaside',
      title: localize({
        key: 'contentType.search.faktaside',
        locale: language,
      }),
    },
    {
      id: 'statistikkbanktabell',
      title: localize({
        key: 'contentType.search.statistikkbanktabell',
        locale: language,
      }),
    },
    {
      id: 'publikasjon',
      title: localize({
        key: 'contentType.search.publikasjon',
        locale: language,
      }),
    },
    {
      id: 'report',
      title: localize({
        key: 'contentType.search.report',
        locale: language,
      }),
    },
    {
      id: 'note',
      title: localize({
        key: 'contentType.search.note',
        locale: language,
      }),
    },
    {
      id: 'analysis',
      title: localize({
        key: 'contentType.search.analysis',
        locale: language,
      }),
    },
    {
      id: 'economicTrends',
      title: localize({
        key: 'contentType.search.economicTrends',
        locale: language,
      }),
    },
    {
      id: 'discussionPaper',
      title: localize({
        key: 'contentType.search.discussionPaper',
        locale: language,
      }),
    },
  ]

  function getNameDataResult() {
    const solrNameResult: SolrResponse = getNameSearchResult(sanitizedTerm, false)
    if (solrNameResult.status === 200 && solrNameResult.body) {
      const body = JSON.parse(solrNameResult.body)
      const docs = body.response.docs
      const filteredResult = docs.filter((doc: NameSearchData) => doc.name === sanitizedTerm.toUpperCase())
      const mainRes =
        filteredResult.length &&
        filteredResult.reduce((acc: NameSearchData, current: NameSearchData) => {
          if (!acc || acc.count < current.count) {
            acc = current // get the hit with the highest count
          }
          return acc
        })
      return mainRes
    } else {
      return undefined
    }
  }

  /* query solr */
  const solrResult: SolrPrepResultAndTotal = sanitizedTerm
    ? solrTestNewSearch(sanitizedTerm)
    : {
        total: 0,
        hits: [],
        contentTypes: [],
        subjects: [],
      }

  const totalHits = solrResult.total
  /* prepare props */
  const props: SearchResultProps = {
    bestBetHit: undefined,
    hits: solrResult.hits,
    total: solrResult.total,
    term: sanitizedTerm,
    count,
    title: content.displayName,
    nameSearchData: getNameDataResult(),
    noHitMessage: localize({
      key: 'searchResult.noHitMessage',
      locale: language,
    }),
    buttonTitle: localize({
      key: 'button.showMore',
      locale: language,
    }),
    showingPhrase: localize({
      key: 'publicationArchive.showing',
      locale: language,
    }),
    limitResultPhrase: localize({
      key: 'filter.limitResult',
      locale: language,
    }),
    removeFilterPhrase: localize({
      key: 'filter.removeFilterSelection',
      locale: language,
    }),
    searchServiceUrl: serviceUrl({
      service: 'freeTextNewSearch',
    }),
    nameSearchUrl: serviceUrl({
      service: 'nameSearch',
    }),
    mainSearchPhrase: localize({
      key: 'mainSearch',
      locale: language,
    }),
    chooseSubjectPhrase: localize({
      key: 'dropdown.chooseSubject',
      locale: language,
    }),
    chooseContentTypePhrase: localize({
      key: 'dropdown.chooseContenttype',
      locale: language,
    }),
    searchText: localize({
      key: 'menuSearch',
      locale: language,
    }),
    sortPhrase: localize({
      key: 'searchResult.sort.title',
      locale: language,
    }),
    sortBestHitPhrase: localize({
      key: 'searchResult.sort.bestHit',
      locale: language,
    }),
    sortDatePhrase: localize({
      key: 'searchResult.sort.date',
      locale: language,
    }),
    allContentTypesPhrase: localize({
      key: 'publicationArchive.allTypes',
      locale: language,
    }),
    allSubjectsPhrase: localize({
      key: 'publicationArchive.allSubjects',
      locale: language,
    }),
    namePhrases: {
      readMore: localize({
        key: 'nameSearch.readMore',
        locale: language,
      }),
      nameSearchResultTitle: localize({
        key: 'nameSearch.resultTitle',
        locale: language,
      }),
      thereAre: localize({
        key: 'nameSearch.thereAre',
        locale: language,
      }),
      with: localize({
        key: 'nameSearch.with',
        locale: language,
      }),
      have: localize({
        key: 'nameSearch.have',
        locale: language,
      }),
      asTheir: localize({
        key: 'nameSearch.asTheir',
        locale: language,
      }),
      threeOrLessText: localize({
        key: 'nameSearch.threeOrLessText',
        locale: language,
      }),
      women: localize({
        key: 'women',
        locale: language,
      }),
      men: localize({
        key: 'men',
        locale: language,
      }),
      types: {
        firstgivenandfamily: localize({
          key: 'nameSearch.types.firstgivenandfamily',
          locale: language,
        }),
        middleandfamily: localize({
          key: 'nameSearch.types.middleandfamily',
          locale: language,
        }),
        family: localize({
          key: 'nameSearch.types.family',
          locale: language,
        }),
        onlygiven: localize({
          key: 'nameSearch.types.onlygiven',
          locale: language,
        }),
        onlygivenandfamily: localize({
          key: 'nameSearch.types.onlygivenandfamily',
          locale: language,
        }),
        firstgiven: localize({
          key: 'nameSearch.types.firstgiven',
          locale: language,
        }),
      },
    },
    searchPageUrl,
    language,
    contentTypePhrases: contentTypePhrases,
    contentTypes: solrResult.contentTypes,
    subjects: solrResult.subjects,
    contentTypeUrlParam: req.params?.innholdstype?.toString(),
    subjectUrlParam: req.params?.emne?.toString(),
    searchResultSRText: localize({
      key: 'searchResult.screenReader.result',
      locale: language,
      values: [sanitizedTerm, totalHits.toString()],
    }),
  }

  return render('site/parts/searchResultNewSolr/searchResultNewSolrView', props, req)
}
