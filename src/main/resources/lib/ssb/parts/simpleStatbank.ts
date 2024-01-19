// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { type Dataset, type Data, type Dimension } from '/lib/types/jsonstat-toolkit'
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
      const values = timeDimensions.map((timeDimension) => {
        const data: Data | null = dataset?.Data({
          [dimensionCode]: dataDimension,
          Tid: timeDimension,
        }) as Data

        return data.value ?? data.status
      })

      return {
        displayName: filterDimensionCode?.Category(dataDimension)?.label,
        dataCode: dataDimension, // Hvis vi må ta høyde for at de dytter inn mer enn en dimensjon her må det hånderes
        value: values[0], // Forventer at dette arryayet kun har et element (kun en tidsserie)
      }
    })

    return {
      time: timeDimensions[0],
      data: result,
    }
  } catch (error) {
    log.error('getStatbankApiData failed: ' + error)
    return undefined
  }
}

export interface SimpleStatbankResult {
  time: string
  data: DimensionData[]
}

interface DimensionData {
  displayName: string
  dataCode: string
  value: (string | number)[]
}
