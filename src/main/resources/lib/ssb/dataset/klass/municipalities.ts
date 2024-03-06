import { get as getContent, Content } from '/lib/xp/content'
import { getSiteConfig } from '/lib/xp/portal'
import { sanitize } from '/lib/xp/common'
import { County, list as countyList } from '/lib/ssb/dataset/klass/counties'
import { DatasetRepoNode } from '/lib/ssb/repo/dataset'

import { getDataset, extractKey } from '/lib/ssb/dataset/dataset'
import {
  fromDatasetRepoCache,
  fromParsedMunicipalityCache,
  fromMunicipalityWithCodeCache,
  fromMunicipalityWithNameCache,
} from '/lib/ssb/cache/cache'
import {
  MunicipalCode,
  MunicipalityChange,
  MunicipalityChangeList,
  MunicipalityWithCounty,
  RequestWithCode,
} from '/lib/types/municipalities'
import { type DataSource } from '/site/mixins/dataSource'

/**
 * @return {array} Returns everything in the "code" node from ssb api
 */
export const list: () => Array<MunicipalCode> = () => getMunicipalsFromContent()

/**
 *
 * @param {string} queryString
 * @return {array} a set of municipals containing the querystring in municiaplity code or name
 */
export const query: (queryString: string) => Array<MunicipalCode> = (queryString) =>
  getMunicipalsFromContent().filter((municipal) =>
    RegExp(queryString.toLowerCase()).test(`${municipal.code} ${municipal.name.toLowerCase()}`)
  )

function getMunicipalsFromContent(): Array<MunicipalCode> {
  const siteConfig: XP.SiteConfig | null = getSiteConfig()
  if (!siteConfig) return []

  const key: string | undefined = siteConfig.municipalDataContentId
  if (key) {
    const dataSource: Content<DataSource> | null = getContent({
      key,
    })
    if (dataSource) {
      const dataset: DatasetRepoNode<object> | undefined = fromDatasetRepoCache(
        `${dataSource.data.dataSource?._selected}/${extractKey(dataSource)}`,
        () => {
          return getDataset(dataSource)
        }
      )
      if (dataset && dataset.data) {
        const data: { codes: Array<MunicipalCode> } = dataset.data as { codes: Array<MunicipalCode> }
        return data.codes
      }
    }
  }
  return []
}

/**
 *
 * @param {string} municipalName required
 * @param {string} countyName optional, if set it will be added to the path
 * @return {string} create valid municipal path
 */
export function createPath(municipalName: string, countyName?: string): string {
  const path: string = countyName !== undefined ? `${municipalName}-${countyName}` : `${municipalName}`
  return `/${sanitize(path)}`
}

export function municipalsWithCounties(): Array<MunicipalityWithCounty> {
  const counties: Array<County> = countyList()
  const municipalities: Array<MunicipalCode> = list()
  // Caching this since it is a bit heavy
  return fromParsedMunicipalityCache('parsedMunicipality', () =>
    municipalities.map((municipality: MunicipalCode) => {
      const getTwoFirstDigits = /^(\d\d).*$/
      const currentCounty: County = counties.filter(
        (county: County) => county.code === municipality.code.replace(getTwoFirstDigits, '$1')
      )[0]
      const numMunicipalsWithSameName: number = municipalities.filter((mun) => mun.name === municipality.name).length

      return {
        code: municipality.code,
        displayName:
          numMunicipalsWithSameName === 1 ? municipality.name : `${municipality.name} i ${currentCounty.name}`,
        county: {
          name: currentCounty.name,
        },
        path:
          numMunicipalsWithSameName === 1
            ? createPath(municipality.name)
            : createPath(municipality.name, currentCounty.name),
      }
    })
  )
}

export function getMunicipality(req: RequestWithCode): MunicipalityWithCounty | undefined {
  let municipality: MunicipalityWithCounty | undefined
  if (req.params && req.params.selfRequest && req.params.municipality) {
    // TODO: Figure out why municipality is duplicated in params!
    if (Array.isArray(req.params.municipality))
      municipality = JSON.parse(req.params.municipality[0]) as MunicipalityWithCounty
    else municipality = JSON.parse(req.params.municipality) as MunicipalityWithCounty
    if (municipality) {
      return municipality
    }
  }

  const municipalities: Array<MunicipalityWithCounty> = municipalsWithCounties()
  if (req.path) {
    const municipalityName: string = req.path.replace(/^.*\//, '').toLowerCase()
    municipality = getMunicipalityByName(municipalities, municipalityName)
  } else if (req.code) {
    municipality = getMunicipalityByCode(municipalities, req.code)
  }

  if (!municipality && (req.mode === 'edit' || req.mode === 'preview' || req.mode === 'inline')) {
    const siteConfig: XP.SiteConfig | null = getSiteConfig()
    if (siteConfig) {
      const defaultMunicipality: string = siteConfig.defaultMunicipality
      municipality = getMunicipalityByCode(municipalities, defaultMunicipality)
    }
  }

  return municipality
}

/**
 *
 * @param {array} municipalities
 * @param {number} municipalityCode
 * @return {*}
 */

function getMunicipalityByCode(
  municipalities: Array<MunicipalityWithCounty>,
  municipalityCode: string
): MunicipalityWithCounty | undefined {
  return fromMunicipalityWithCodeCache(`municipality_${municipalityCode}`, () => {
    const changes: Array<MunicipalityChange> | undefined = changesWithMunicipalityCode(municipalityCode)
    const municipality: Array<MunicipalityWithCounty> = municipalities.filter(
      (municipality) => municipality.code === municipalityCode
    )
    return municipality.length > 0
      ? {
          ...municipality[0],
          changes,
        }
      : undefined
  })
}

/**
 *
 * @param {array} municipalities
 * @param {string} municipalityName
 * @return {*}
 */

export function getMunicipalityByName(
  municipalities: Array<MunicipalityWithCounty>,
  municipalityName: string
): MunicipalityWithCounty | undefined {
  return fromMunicipalityWithNameCache(`municipality_${municipalityName}`, () => {
    const municipality: Array<MunicipalityWithCounty> = municipalities.filter(
      (municipality) => municipality.path === `/${municipalityName}`
    )

    if (municipality.length > 0) {
      const changes: Array<MunicipalityChange> | undefined = changesWithMunicipalityCode(municipality[0].code)
      return {
        ...municipality[0],
        changes,
      }
    }
    return undefined
  })
}

function changesWithMunicipalityCode(municipalityCode: string): Array<MunicipalityChange> | undefined {
  const changeList: Array<MunicipalityChange> = getMunicipalityChanges().codeChanges
  const changes: Array<MunicipalityChange> = changeList.filter((change) => {
    return (
      (change.oldCode === municipalityCode || change.newCode === municipalityCode) &&
      removeCountyFromMunicipalityName(change.oldName) === removeCountyFromMunicipalityName(change.newName)
    )
  })
  return changes
}

function getMunicipalityChanges(): MunicipalityChangeList {
  const changeListId: string | undefined = getSiteConfig<XP.SiteConfig>()?.municipalChangeListContentId
  if (changeListId) {
    const dataSource: Content<DataSource> | null = getContent({
      key: changeListId,
    })
    if (dataSource) {
      const dataset: DatasetRepoNode<object> | undefined = fromDatasetRepoCache(
        `${dataSource.data.dataSource?._selected}/${extractKey(dataSource)}`,
        () => {
          return getDataset(dataSource)
        }
      )
      if (dataset && dataset.data) {
        const data: MunicipalityChangeList = dataset.data as MunicipalityChangeList
        return data
      }
    }
  }

  return {
    codeChanges: [],
  }
}

export function removeCountyFromMunicipalityName(municipalityName: string): string {
  return municipalityName.split('(')[0].trim()
}
