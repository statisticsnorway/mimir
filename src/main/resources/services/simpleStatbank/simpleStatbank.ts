// @ts-ignore
import JSONstat from 'jsonstat-toolkit/import.mjs'
import { type Dataset, type Data, type Dimension } from '/lib/types/jsonstat-toolkit'
import { fetchStatbankApiDataQuery } from '/lib/ssb/dataset/statbankApi/statbankApi'

export const get = (req: XP.Request): XP.Response => {
  const dimensionCode: string = req.params.code ?? ''
  const tableId: string = req.params.table ?? ''
  const query: string = req.params.json ?? ''

  const statbankApiData: JSONstat = fetchStatbankApiDataQuery(tableId, query)
  const dataset: Dataset | null = statbankApiData ? JSONstat(statbankApiData).Dataset('dataset') : null
  const filterDimensionCode: Dimension | null = dataset?.Dimension(dimensionCode) as Dimension | null
  const dataDimensions: Array<string> = filterDimensionCode?.id as Array<string>
  const filterDimensionTime: Dimension | null = dataset?.Dimension('Tid') as Dimension
  const timeDimensions: Array<string> = filterDimensionTime?.id as Array<string>

  try {
    const result = dataDimensions.map(function (dataDimension) {
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
      status: 200,
      contentType: 'application/json',
      body: { tid: timeDimensions[0], data: result },
    }
  } catch (error) {
    log.error(error)
    return {
      status: 404,
      contentType: 'application/json',
      body: 'query, table or code is wrong',
    }
  }
}
