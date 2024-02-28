import { PreparedArticles } from '/lib/types/article'

export interface SubjectArticleListProps {
  title: string
  buttonTitle: string
  articleServiceUrl: string
  currentPath: string
  start: number
  count: number
  showSortAndFilter: boolean
  language: string
  articles: Array<PreparedArticles>
  totalArticles: number
  showAllArticles: boolean
}
