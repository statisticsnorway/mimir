// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { type Dataset, type Data, type Dimension, Category } from '/lib/types/jsonstat-toolkit'
import { fetchStatbankApiDataQuery } from '/lib/ssb/dataset/statbankApi/statbankApi'
import { type SimpleStatbankResult, type DimensionData } from '/lib/types/partTypes/simpleStatbank'
import { createHumanReadableFormat } from '/lib/ssb/utils/utils'
import { localizeTimePeriod } from '/lib/ssb/utils/language'
import { ensureArray } from '../utils/arrayUtils'

export function getStatbankApiData(
  dimensionCode: string,
  urlOrId: string,
  query: string
): SimpleStatbankResult | undefined {
  const statbankApiData: JSONstat = fetchStatbankApiDataQuery(urlOrId, query)
  const dataset: Dataset | null = statbankApiData ? JSONstat(statbankApiData).Dataset('dataset') : null
  const filterDimensionCode: Dimension | Dimension[] | null | undefined = dataset?.Dimension(dimensionCode)
  const dataDimensions = ensureArray((filterDimensionCode as Dimension)?.id)
  const filterDimensionTime: Dimension | null = dataset?.Dimension('Tid') as Dimension
  const timeDimensions = ensureArray(filterDimensionTime?.id)

  try {
    const result: DimensionData[] = dataDimensions.map(function (dataDimension: string) {
      const data: Data | null = dataset?.Data({
        [dimensionCode]: dataDimension,
      }) as Data

      const filterCategory: Category | null = (filterDimensionCode as Dimension)?.Category(
        dataDimension
      ) as Category | null
      const value: number | string | null = data.value && !(data.value instanceof Array) ? data.value : null

      return {
        displayName: filterCategory?.label ?? '',
        dataCode: dataDimension,
        value: value ? createHumanReadableFormat(value) : undefined,
        time: dimensionCode === 'Tid' ? dataDimension : localizeTimePeriod(timeDimensions[0]),
      }
    })

    return {
      data: result,
    }
  } catch (error) {
    log.error('getStatbankApiData failed: ' + error)
    return undefined
  }
}
