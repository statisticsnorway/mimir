import { Request, Response } from 'enonic-types/controller'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { Content } from 'enonic-types/content'
import { Component } from 'enonic-types/portal'
import { BannerPartConfig } from './banner-part-config'
import { MunicipalityWithCounty } from '../../../lib/ssb/dataset/klass/municipalities'
import { Page } from '../../content-types/page/page'

const {
  getContent,
  getComponent,
  imageUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  getMunicipality, removeCountyFromMunicipalityName
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  getImageAlt
} = __non_webpack_require__('/lib/ssb/utils/imageUtils')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const view: ResourceKey = resolve('./banner.html') as ResourceKey

exports.get = function(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request): Response => renderPart(req)

function renderPart(req: Request): Response {
  const page: Content<Page> = getContent()
  const part: Component<BannerPartConfig> = getComponent()
  const pageType: BannerPartConfig['pageType'] = part.config.pageType
  const factsAbout: string = i18nLib.localize({
    key: 'factsAbout'
  })
  let subTitleFactPage: string = ''
  if ('faktaside' in pageType) {
    subTitleFactPage = pageType.faktaside.subTitle ? pageType.faktaside.subTitle : factsAbout
  }
  const municipality: MunicipalityWithCounty | undefined = pageType._selected === 'kommunefakta' ? getMunicipality(req) : undefined
  const municipalityName: string | undefined = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined
  const imgSrcSet: ImageConf | undefined = part.config.image ? imageSrcSet(part.config.image) : undefined

  // Remove uppercase for page title when accompanied by "Fakta om"
  const factPageTitle: string = `${subTitleFactPage} ${page.displayName}`.toLowerCase()
  const imageAlt: string | undefined = part.config.image ? getImageAlt(part.config.image) : undefined

  const body: string = render(view, {
    ...imgSrcSet,
    pageDisplayName: page.displayName,
    bannerImageAltText: imageAlt ? imageAlt : ' ',
    bannerImage: part.config.image ? imageUrl({
      id: part.config.image,
      scale: 'block(350,100)'
    }) : undefined,
    municipalityTitle: municipality ? municipalityName + ' (' + municipality.county.name + ')' : undefined,
    pageType,
    subTitleFactPage,
    factPageTitle: factPageTitle.charAt(0).toUpperCase() + factPageTitle.slice(1)
  })

  return {
    body,
    contentType: 'text/html'
  }
}


function imageSrcSet(imageId: string): ImageConf {
  const widths = [3840, 2560, 2000, 1500, 1260, 800, 650]
  const srcset = widths.map((width: number) => `${imageUrl({
    id: imageId,
    scale: `block(${width},272)`
  })} ${width}w`).join(', ')
  const sizes = `(min-width: 2561px) 3840px,
                 (min-width: 2001px) and (max-width: 2560px) 2560px,
                 (min-width: 1501px) and (max-width: 2000px) 2000px,
                 ((min-width: 1261px) and (max-width: 1500px)) 1500px, 
                 ((min-width: 801px) and (max-width: 1261px)) 1260px, 
                 ((min-width: 651px) and (max-width: 800px)) 800px, 650px`

  return {
    sizes,
    srcset
  }
}

interface ImageConf {
  sizes: string;
  srcset: string;
}
