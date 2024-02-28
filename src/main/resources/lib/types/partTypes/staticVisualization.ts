import { HtmlTable } from '/lib/ssb/parts/table'
import { SourceList } from '/lib/types/sources'
import { StaticVisualization } from '/site/content-types/staticVisualization'
import { Default } from '/site/pages/default'

export interface StaticVisualizationProps {
  id: string
  title: string
  altText: string
  imageSrc: string
  footnotes: StaticVisualization['footNote']
  sources: SourceList
  longDesc: string | undefined
  sourcesLabel: string
  showAsGraphLabel: string
  showAsTableLabel: string
  descriptionStaticVisualization: string
  inFactPage?: boolean
  language: string
  tableData: HtmlTable | undefined
}

export interface DefaultPage {
  page: {
    config: Default
  }
}
