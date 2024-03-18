import { type SourceList } from '/lib/types/sources'
import { type InfoGraphics } from '/site/parts/infoGraphics'

export interface InfoGraphicsProps {
  title: string
  altText: string
  imageSrc: string
  footnotes: InfoGraphics['footNote']
  sources: SourceList
  longDesc: string
  sourcesLabel: string
  descriptionStaticVisualization: string
  inFactPage?: boolean
  oldContent?: boolean
}
