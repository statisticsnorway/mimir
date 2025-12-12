import { type Request, type Response } from '@enonic-types/core'
import { type Content } from '/lib/xp/content'
import { getContent, getComponent } from '/lib/xp/portal'
import { assetUrl } from '/lib/enonic/asset'
import { getMunicipality, removeCountyFromMunicipalityName } from '/lib/ssb/dataset/klass/municipalities'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'

import { render as r4XpRender } from '/lib/enonic/react4xp'
import { getPhrases } from '/lib/ssb/utils/language'
import { type Phrases } from '/lib/types/language'
import { type BannerProps } from '/lib/types/partTypes/banner'
import { forceArray } from '/lib/ssb/utils/arrayUtils'
import { type RequestWithCode } from '/lib/types/municipalities'
import { type Page } from '/site/content-types'
import { type Default } from '/site/pages/default'

export function get(req: Request): Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: Request): Response {
  return renderPart(req)
}

function renderPart(req: Request): Response {
  const page = getContent<Content<Page>>()
  if (!page) throw Error('No page found')

  const part = getComponent<XP.PartComponent.Banner>()
  if (!part) throw Error('No component found')

  const myRegion = getCurrentRegion(part, page)
  const pageType = part.config.pageType
  const phrases = getPhrases(page) as Phrases

  const factsAbout = phrases.factsAbout
  let subTitleFactPage = ''
  if ('faktaside' in pageType) {
    subTitleFactPage = pageType.faktaside.subTitle ? pageType.faktaside.subTitle : factsAbout
  }

  const isLandingPage = 'general' in pageType && pageType.general.landingPage
  const imgSrcSet = part.config.image ? imageSrcSet(part.config.image, isLandingPage, myRegion?.view) : undefined

  // Remove uppercase for page title when accompanied by "Fakta om"
  const factPageTitle = `${subTitleFactPage} ${page.displayName}`.toLowerCase()
  const imageAlt = getImageAlt(part.config.image)
  const props: BannerProps = {
    ...imgSrcSet,
    pageDisplayName: page.displayName,
    bannerImageAltText: imageAlt ? imageAlt : ' ',
    bannerImage: part.config.image
      ? imageUrl({
          id: part.config.image,
          scale: 'block(350,100)',
          format: 'jpg',
        })
      : undefined,
    municipalityTitle: getMunicipalityTitle(pageType, req),
    pageType: page.page?.config.pageType as string,
    selectedPageType: pageType._selected,
    subTitleFactPage,
    factPageTitle: 'faktaside' in pageType && pageType.faktaside.title,
    fullFactPageTitle: factPageTitle.charAt(0).toUpperCase() + factPageTitle.slice(1),
    generalPageTitle: 'general' in pageType && pageType.general.generalTitle,
    isLandingPage,
    logoUrl: app?.config?.['ssb.baseUrl'] ?? 'https://www.ssb.no',
    logoSrc: assetUrl({
      path: 'SSB_logo_white.svg',
    }),
    logoAltText: phrases.logoAltText,
  }

  return r4XpRender('site/parts/banner/banner', props, req, {
    body: `<section
    class="xp-part part-banner position-relative clearfix col-12 searchabletext${
      pageType._selected === 'faktaside' ? ' fact-page-banner' : ''
    }${isLandingPage ? ' landing-page-banner' : ''}"></section>`,
    hydrate: false,
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMunicipalityTitle(pageType: any, req: Request) {
  const municipality = pageType._selected === 'kommunefakta' ? getMunicipality(req as RequestWithCode) : undefined
  const municipalityName = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined
  return municipality ? municipalityName + ' (' + municipality.county.name + ')' : undefined
}

function getCurrentRegion(part: XP.PartComponent.Banner, page: Content<Page>) {
  const region = part.path?.split('/')[1]
  const myPage = page.page?.config as Default
  const myRegions = myPage?.regions ? forceArray(myPage.regions) : []
  return myRegions.find((r) => r.region === region)
}

// Inefficient, should only do one imageUrl call and then string replace the width
function imageSrcSet(imageId: string, isLandingPage: boolean, sectionType: string | undefined) {
  let widths: Array<number> = []

  switch (sectionType) {
    case 'plainSection':
      widths = [1260, 800, 650]
      break
    case 'card':
      widths = [800, 650]
      break
    case 'full':
    default:
      widths = [3840, 2560, 2000, 1500, 1260, 800, 650]
  }

  const srcset = widths

    .map(
      (width: number) =>
        `${imageUrl({
          id: imageId,
          scale: `block(${width},${isLandingPage ? '930' : '272'})`,
        })} ${width}w`
    )
    .join(', ')

  let sizes: string
  switch (sectionType) {
    case 'plainSection':
      sizes = `(min-width: 801px) 1260px,
        ((min-width: 651px) and (max-width: 800px)) 800px, 650px`
      break
    case 'card':
      sizes = `(min-width: 801px) 800px, 650px`
      break
    case 'full':
    default:
      sizes = `(min-width: 2561px) 3840px,
        (min-width: 2001px) and (max-width: 2560px) 2560px,
        (min-width: 1501px) and (max-width: 2000px) 2000px,
        ((min-width: 1261px) and (max-width: 1500px)) 1500px,
        ((min-width: 801px) and (max-width: 1261px)) 1260px,
        ((min-width: 651px) and (max-width: 800px)) 800px, 650px`
  }

  return {
    sizes,
    srcset,
  }
}
