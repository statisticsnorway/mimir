import { type Content } from '/lib/xp/content'
import { assetUrl, getContent, getComponent } from '/lib/xp/portal'
import {
  RequestWithCode,
  getMunicipality,
  removeCountyFromMunicipalityName,
} from '/lib/ssb/dataset/klass/municipalities'
import { imageUrl, getImageAlt } from '/lib/ssb/utils/imageUtils'

import { renderError } from '/lib/ssb/error/error'

import { render as r4XpRender } from '/lib/enonic/react4xp'
import { getPhrases } from '/lib/ssb/utils/language'
import { type Phrases } from '/lib/types/language'
import { type Page } from '/site/content-types'

export function get(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  return renderPart(req)
}

function renderPart(req: XP.Request): XP.Response {
  const page = getContent<Content<Page>>()
  if (!page) throw Error('No page found')

  const part = getComponent<XP.PartComponent.Banner>()
  if (!part) throw Error('No component found')
  const pageType = part.config.pageType
  const phrases = getPhrases(page) as Phrases

  const factsAbout = phrases.factsAbout
  let subTitleFactPage = ''
  if ('faktaside' in pageType) {
    subTitleFactPage = pageType.faktaside.subTitle ? pageType.faktaside.subTitle : factsAbout
  }
  const municipality = pageType._selected === 'kommunefakta' ? getMunicipality(req as RequestWithCode) : undefined
  const municipalityName = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined
  const imgSrcSet = part.config.image ? imageSrcSet(part.config.image) : undefined

  // Remove uppercase for page title when accompanied by "Fakta om"
  const factPageTitle = `${subTitleFactPage} ${page.displayName}`.toLowerCase()
  const imageAlt = part.config.image ? getImageAlt(part.config.image) : undefined

  const isLandingPage = 'general' in pageType && pageType.general.landingPage

  const props = {
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
    municipalityTitle: municipality ? municipalityName + ' (' + municipality.county.name + ')' : undefined,
    pageType: page.page?.config.pageType,
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
  })
}

// Inefficient, should only do one imageUrl call and then string replace the width
function imageSrcSet(imageId: string) {
  const widths = [3840, 2560, 2000, 1500, 1260, 800, 650]
  const srcset = widths
    .map(
      (width: number) =>
        `${imageUrl({
          id: imageId,
          scale: `block(${width},272)`,
        })} ${width}w`
    )
    .join(', ')
  const sizes = `(min-width: 2561px) 3840px,
                 (min-width: 2001px) and (max-width: 2560px) 2560px,
                 (min-width: 1501px) and (max-width: 2000px) 2000px,
                 ((min-width: 1261px) and (max-width: 1500px)) 1500px,
                 ((min-width: 801px) and (max-width: 1261px)) 1260px,
                 ((min-width: 651px) and (max-width: 800px)) 800px, 650px`

  return {
    sizes,
    srcset,
  }
}
