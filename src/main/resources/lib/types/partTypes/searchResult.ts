import { type Node } from '@enonic-types/lib-node'
import { type BestBetContent } from '/lib/types/bestebet'
import { type Facet, type PreparedSearchResult } from '/lib/types/solr'

export interface SearchResultProps {
  bestBetHit: PreparedSearchResult | undefined
  hits: Array<PreparedSearchResult>
  title: string
  total: number
  count: number
  term: string
  buttonTitle: string
  noHitMessage: string
  showingPhrase: string
  limitResultPhrase: string
  removeFilterPhrase: string
  mainSearchPhrase: string
  chooseSubjectPhrase: string
  chooseContentTypePhrase: string
  searchText: string
  sortPhrase: string
  sortBestHitPhrase: string
  sortDatePhrase: string
  allContentTypesPhrase: string
  allSubjectsPhrase: string
  searchServiceUrl: string
  nameSearchToggle: boolean
  nameSearchData: object | undefined
  nameSearchUrl: string
  namePhrases: {
    readMore: string
    nameSearchResultTitle: string
    thereAre: string
    with: string
    have: string
    asTheir: string
    threeOrLessText: string
    women: string
    men: string
    types: {
      firstgivenandfamily: string
      middleandfamily: string
      family: string
      onlygiven: string
      onlygivenandfamily: string
      firstgiven: string
    }
  }
  searchPageUrl: string
  language: string
  contentTypePhrases: Array<ContentTypePhrase>
  contentTypes: Array<Facet>
  subjects: Array<Facet>
  GA_TRACKING_ID: string | null
  contentTypeUrlParam: string | undefined
  subjectUrlParam: string | undefined
  searchResultSRText: string
}

export interface BestBet extends Node {
  data: {
    linkedSelectedContentResult: BestBetContent['linkedSelectedContentResult']
    linkedContentTitle: BestBetContent['linkedContentTitle']
    linkedContentHref: BestBetContent['linkedContentHref']
    linkedContentIngress: BestBetContent['linkedContentIngress']
    linkedContentType: BestBetContent['linkedContentType']
    linkedContentDate: BestBetContent['linkedContentDate']
    linkedContentSubject: BestBetContent['linkedContentSubject']
    linkedEnglishContentSubject: BestBetContent['linkedEnglishContentSubject']
    searchWords: BestBetContent['searchWords']
  }
}

export interface ContentTypePhrase {
  id: string
  title: string
}
