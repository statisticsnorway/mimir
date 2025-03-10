import { type Node } from '/lib/xp/node'
import { type Facet, type PreparedSearchResult } from '/lib/types/solr'
import { type BestBetContent } from '../bestbet'

export interface NameSearchData {
  count: string
  gender: string
  name: string
  doc: string
  type: string
}

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
  nameSearchData: NameSearchData | undefined
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
      [key: string]: string
    }
  }
  searchPageUrl: string
  language: string
  contentTypePhrases: Array<ContentTypePhrase>
  contentTypes: Array<Facet>
  subjects: Array<Facet>
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
