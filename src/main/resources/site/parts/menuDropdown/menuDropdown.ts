import { Content } from 'enonic-types/content'
import { Request, Response } from 'enonic-types/controller'
import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { ResourceKey } from 'enonic-types/thymeleaf'
import { Component } from 'enonic-types/portal'
import { MunicipalityWithCounty } from '../../../lib/ssb/dataset/klass/municipalities'
import { MenuDropdownPartConfig } from '../menuDropdown/menuDropdown-part-config'
import { SiteConfig } from '../../site-config'
import { MenuDropdown } from '../../content-types/menuDropdown/menuDropdown'

const {
  assetUrl,
  getContent,
  getComponent,
  pageUrl,
  getSiteConfig,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  municipalsWithCounties,
  getMunicipality,
  removeCountyFromMunicipalityName
} = __non_webpack_require__('/lib/ssb/dataset/klass/municipalities')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const i18nLib = __non_webpack_require__('/lib/xp/i18n')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp
const view: ResourceKey = resolve('./menuDropdown.html')

exports.get = (req: Request):Response | React4xpResponse => {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req:Request) => renderPart(req)

function renderPart(req:Request): Response | React4xpResponse {
  const parsedMunicipalities:Array<MunicipalityWithCounty> = municipalsWithCounties()
  const municipality:MunicipalityWithCounty | undefined = getMunicipality(req)
  const component: Component<MenuDropdownPartConfig> = getComponent()
  const siteConfig: SiteConfig = getSiteConfig()
  let mapFolder: string = '/mapdata'

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl: string = assetUrl( {
    path: mapFolder
  })

  const dataServiceUrl: string = serviceUrl({
    service: 'municipality'
  })

  const page: Content<MenuDropdown> = getContent()
  const baseUrl: string = component.config.basePage ?
    pageUrl({
      id: component.config.basePage
    }) :
    pageUrl({
      id: page._id
    })

  const searchBarText: string = i18nLib.localize({
    key: 'menuDropdown.searchBarText'
  })

  const municipalityItems: Array<Municipality> = parsedMunicipalities.map( (municipality) => ({
    id: municipality.path,
    title: municipality.displayName
  }))

  // Dropdown react object for sticky menu
  const dropdownComponent: React4xpObject = new React4xp('site/parts/menuDropdown/DropdownMunicipality')
    .setProps({
      ariaLabel: searchBarText,
      placeholder: searchBarText,
      items: municipalityItems,
      baseUrl: baseUrl
    })
    .setId('dropdownId')
    .uniqueId()

  const municipalityName: string | undefined = municipality ? removeCountyFromMunicipalityName(municipality.displayName) : undefined

  const model: ThymeleafModel = {
    modeMunicipality: component.config.modeMunicipality,
    displayName: page.displayName,
    baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    municipality: municipality,
    municipalities: parsedMunicipalities,
    municipalityName: municipalityName,
    dropdownId: dropdownComponent.react4xpId
  }

  const thymeleafRender: string = render(view, model)

  const body: string = dropdownComponent.renderBody({
    body: thymeleafRender,
    clientRender: req.mode !== 'edit'
  })

  return {
    body,
    pageContributions: dropdownComponent.renderPageContributions(),
    contentType: 'text/html'
  }
}

interface Municipality {
  id: string,
  title: string
}

interface ThymeleafModel {
  modeMunicipality: boolean,
  displayName: string,
  baseUrl: string,
  dataPathAssetUrl: string,
  dataServiceUrl: string,
  municipality: MunicipalityWithCounty | undefined,
  municipalities: Array<MunicipalityWithCounty>,
  municipalityName: string | undefined,
  dropdownId: string
}
