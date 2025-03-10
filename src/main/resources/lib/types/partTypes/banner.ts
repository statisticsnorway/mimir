import { type Default } from '/site/pages/default'

export type BannerProps = {
  bannerImage?: string
  regionType?: Default['regions'][number]['view']
  bannerImageAltText?: string
  sizes?: string
  srcset?: string
  pageType?: string
  selectedPageType?: string
  municipalityTitle?: string
  pageDisplayName?: string
  subTitleFactPage?: string
  factPageTitle?: string | boolean
  fullFactPageTitle?: string
  generalPageTitle?: string | boolean
  isLandingPage?: boolean
  logoUrl?: string
  logoSrc?: string
  logoAltText?: string
}
