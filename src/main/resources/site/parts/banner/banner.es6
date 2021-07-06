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
const view = resolve('./banner.html')

exports.get = function(req) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req)

function renderPart(req) {
  const page = getContent()
  const part = getComponent()
  const pageType = part.config.pageType
  const factsAbout = i18nLib.localize({
    key: 'factsAbout'
  })
  const municipality = pageType._selected === 'kommunefakta' ? getMunicipality(req) : undefined
  const municipalityName = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined
  const imgSrcSet = part.config.image ? imageSrcSet(part.config.image) : undefined

  const model = {
    ...imgSrcSet,
    pageDisplayName: page.displayName,
    bannerImageAltText: getImageAlt(part.config.image) ? getImageAlt(part.config.image) : ' ',
    bannerImage: part.config.image ? imageUrl({
      id: part.config.image,
      scale: 'block(350,100)'
    }) : undefined,
    municipalityTitle: municipality ? municipalityName + ' (' + municipality.county.name + ')' : undefined,
    pageType,
    factsAbout
  }

  const body = render(view, model)

  return {
    body,
    contentType: 'text/html'
  }
}


/**
 * Creates a src set string to use on a img's srcset atrribute
 * @param {string} imageId
 * @return {string}
 */
function imageSrcSet(imageId) {
  const widths = ['3840', '2560', '2000', '1500', '1260', '800', '650']
  const srcset = widths.map( (width) => `${imageUrl({
    id: imageId,
    scale: `block(${width}, 272)`
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


