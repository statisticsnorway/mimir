import { type Content } from '/lib/xp/content'
import { assetUrl, getContent, getComponent, pageUrl, getSiteConfig, serviceUrl } from '/lib/xp/portal'
import { localize } from '/lib/xp/i18n'
import { render } from '/lib/enonic/react4xp'
import { randomUnsafeString, scriptAsset } from '/lib/ssb/utils/utils'
import {
  type MunicipalityWithCounty,
  municipalsWithCounties,
  getMunicipality,
  removeCountyFromMunicipalityName,
  RequestWithCode,
} from '/lib/ssb/dataset/klass/municipalities'

import { renderError } from '/lib/ssb/error/error'
import { type MenuDropdown } from '/site/content-types'

export function get(req: RequestWithCode): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: RequestWithCode) {
  return renderPart(req)
}

function renderPart(req: RequestWithCode): XP.Response {
  const parsedMunicipalities: Array<MunicipalityWithCounty> = municipalsWithCounties()
  const municipality: MunicipalityWithCounty | undefined = getMunicipality(req)
  const component = getComponent<XP.PartComponent.MenuDropdown>()
  if (!component) throw Error('No part found')

  const siteConfig = getSiteConfig<XP.SiteConfig>()
  if (!siteConfig) throw Error('No site config found')

  let mapFolder = '/mapdata'

  if (typeof siteConfig.kommunefakta !== 'undefined' && siteConfig.kommunefakta.mapfolder) {
    mapFolder = siteConfig.kommunefakta.mapfolder
  }

  const dataPathAssetUrl: string = assetUrl({
    path: mapFolder,
  })

  const dataServiceUrl: string = serviceUrl({
    service: 'municipality',
  })

  const page = getContent<Content<MenuDropdown>>()
  if (!page) throw Error('No page found')

  const baseUrl: string = component.config.basePage
    ? pageUrl({
        id: component.config.basePage,
      })
    : pageUrl({
        id: page._id,
      })

  const searchBarText: string = localize({
    key: 'menuDropdown.searchBarText',
  })

  const municipalityItems: Array<Municipality> = parsedMunicipalities.map((municipality) => ({
    id: municipality.path,
    title: municipality.displayName,
  }))

  const municipalityName: string | undefined = municipality
    ? removeCountyFromMunicipalityName(municipality.displayName)
    : undefined
  const reactUuid: string = randomUnsafeString()

  const props: MenuDropdownProps = {
    modeMunicipality: component.config.modeMunicipality,
    ariaLabel: searchBarText,
    placeholder: searchBarText,
    items: municipalityItems,
    baseUrl: baseUrl,
    dataPathAssetUrl,
    dataServiceUrl,
    municipality: municipality,
    municipalityName: municipalityName,
    municipalityList: municipalityItems,
    dropdownId: reactUuid,
  }

  return render('site/parts/menuDropdown/menuDropdown', props, req, {
    body: '<section class="xp-part menu-dropdown container"></section>',
    pageContributions: {
      bodyEnd: [scriptAsset('js/map.js')],
    },
  })
}

interface Municipality {
  id: string
  title: string
}

interface MenuDropdownProps {
  modeMunicipality: boolean
  ariaLabel: string
  placeholder: string
  items: Municipality[]
  baseUrl: string
  dataPathAssetUrl: string
  dataServiceUrl: string
  municipality: MunicipalityWithCounty | undefined
  municipalityName: string | undefined
  municipalityList: Array<Municipality>
  dropdownId: string
}
