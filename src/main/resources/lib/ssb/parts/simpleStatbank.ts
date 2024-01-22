// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { type Dataset, type Data, type Dimension, Category } from '/lib/types/jsonstat-toolkit'
import { fetchStatbankApiDataQuery } from '/lib/ssb/dataset/statbankApi/statbankApi'

export function getStatbankApiData(
  dimensionCode: string,
  urlOrId: string,
  query: string
): SimpleStatbankResult | undefined {
  const statbankApiData: JSONstat = fetchStatbankApiDataQuery(urlOrId, query)
  const dataset: Dataset | null = statbankApiData ? JSONstat(statbankApiData).Dataset('dataset') : null
  const filterDimensionCode: Dimension | null = dataset?.Dimension(dimensionCode) as Dimension | null
  const dataDimensions: Array<string> = filterDimensionCode?.id as Array<string>
  const filterDimensionTime: Dimension | null = dataset?.Dimension('Tid') as Dimension
  const timeDimensions: Array<string> = filterDimensionTime?.id as Array<string>

  try {
    const result: DimensionData[] = dataDimensions.map(function (dataDimension: string) {
      const data: Data | null = dataset?.Data({
        [dimensionCode]: dataDimension,
      }) as Data

      const filterCategory: Category | null = filterDimensionCode?.Category(dataDimension) as Category | null

      return {
        displayName: filterCategory ? filterCategory.label : '',
        dataCode: dataDimension, // Hvis vi må ta høyde for at de dytter inn mer enn en dimensjon her må det hånderes
        value: data.value ?? data.status, // Forventer at dette arryayet kun har et element (kun en tidsserie)
        time: dimensionCode === 'Tid' ? dataDimension : timeDimensions[0],
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

export interface SimpleStatbankResult {
  data: DimensionData[]
}

interface DimensionData {
  displayName: string
  dataCode: string
  value: (string | number)[]
  time: string
}
