import { get as getContentByKey, type Content } from '/lib/xp/content'
import { sanitizeHtml, getContent, getComponent, pageUrl, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { solrSearch } from '/lib/ssb/utils/solrUtils'
import { getNameSearchResult } from '/lib/ssb/utils/nameSearchUtils'
import { type SolrResponse, type PreparedSearchResult, type SolrPrepResultAndTotal } from '/lib/types/solr'
import { queryNodes, getNode } from '/lib/ssb/repo/common'
import { formatDate } from '/lib/ssb/utils/dateUtils'

import { renderError } from '/lib/ssb/error/error'
import { sanitizeForSolr } from '/lib/ssb/utils/textUtils'
import {
  NameSearchData,
  type BestBet,
  type ContentTypePhrase,
  type SearchResultProps,
} from '/lib/types/partTypes/searchResult'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

export function renderPart(req: XP.Request) {
  /* collect data */
  const content = getContent()
  if (!content) throw Error('No page found')

  const part = getComponent<XP.PartComponent.SearchResult>()
  if (!part) throw Error('No part found')

  const sanitizedTerm: string = req.params.sok ? sanitizeForSolr(req.params.sok) : ''
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

  // eslint-disable-next-line complexity
  function bestBet(): PreparedSearchResult | undefined {
    const result = queryNodes('no.ssb.bestbet', 'master', {
      start: 0,
      count: 1,
      query: `fulltext('data.searchWords', '${sanitizedTerm}', 'AND')`,
    })

    const bet: BestBet | null = result.hits.length
      ? (getNode('no.ssb.bestbet', 'master', result.hits[0].id) as BestBet)
      : null
    let firstBet: BestBet | null
    if (bet && bet.constructor === Array) {
      firstBet = bet[0]
    }
    if (bet && !(bet.constructor === Array)) {
      firstBet = bet
    } else firstBet = null

    let bestBetResult: PreparedSearchResult | null
    if (firstBet && firstBet.constructor !== Array) {
      let date: string = firstBet.data && firstBet.data.linkedContentDate ? firstBet.data.linkedContentDate : ''
      let title: string = firstBet.data && firstBet.data.linkedContentTitle ? firstBet.data.linkedContentTitle : ''
      let href: string = firstBet.data && firstBet.data.linkedContentHref ? firstBet.data.linkedContentHref : ''
      const xpContentId: string | undefined = firstBet.data && firstBet.data.linkedSelectedContentResult?.value
      if (firstBet.data && firstBet.data.linkedSelectedContentResult) {
        const xpContent: Content | null = getContentByKey({
          key: xpContentId,
        })

        if (xpContent) {
          title = xpContent.displayName
          href = pageUrl({
            path: xpContent._path,
          })
          if (firstBet.data.linkedContentDate === 'xp') {
            if (xpContent.publish && xpContent.publish.from) {
              date = xpContent.publish.from
            } else {
              date = ''
            }
          }
        }
      }

      bestBetResult = {
        title: sanitizeHtml(title),
        preface: sanitizeHtml(
          firstBet.data && firstBet.data.linkedContentIngress ? firstBet.data.linkedContentIngress : ''
        ),
        contentType:
          firstBet.data && firstBet.data.linkedContentType
            ? localize({
                key: `contentType.search.${firstBet.data.linkedContentType.toLowerCase()}`,
                locale: language,
              })
            : '',
        url: href,
        mainSubject: getSubjectForLanguage(firstBet),
        secondaryMainSubject: '',
        publishDate: firstBet.data && firstBet.data.linkedContentDate ? firstBet.data.linkedContentDate : '',
        publishDateHuman: date ? formatDate(date, 'PPP', language) : '',
      }
      return bestBetResult
    }
    return undefined
  }

  // if the language is english and the norwegian field exists,
  // but the english field does NOT exist, we default to the norwegian field.
  function getSubjectForLanguage(bet: BestBet): string {
    if (language == 'en' && bet.data && bet.data.linkedEnglishContentSubject) {
      return bet.data.linkedEnglishContentSubject
    } else if (bet.data && bet.data.linkedContentSubject) {
      return bet.data.linkedContentSubject
    } else return ''
  }

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
    ? solrSearch(
        sanitizedTerm,
        language,
        parseInt(part.config.numberOfHits),
        0,
        req.params.emne,
        req.params.innholdstype
      )
    : {
        total: 0,
        hits: [],
        contentTypes: [],
        subjects: [],
      }

  const totalHits = bestBet() ? solrResult.total + 1 : solrResult.total
  /* prepare props */
  const props: SearchResultProps = {
    bestBetHit: bestBet(),
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
      service: 'freeTextSearch',
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
    contentTypeUrlParam: req.params.innholdstype,
    subjectUrlParam: req.params.emne,
    searchResultSRText: localize({
      key: 'searchResult.screenReader.result',
      locale: language,
      values: [sanitizedTerm, totalHits.toString()],
    }),
  }

  return render('site/parts/searchResult/searchResultView', props, req)
}
