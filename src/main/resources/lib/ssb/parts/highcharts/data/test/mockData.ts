import { type Dataset } from '/lib/types/jsonstat-toolkit'

// Mock data for testing highcharts with statbank as data source (PxAPI2 and old statbankApi)
export const mockPxApi2ResponseOslo = {
  length: 5,
  id: ['KOKart0000', 'Tid', 'KOKkommuneregion0000', 'ContentsCode', 'KOKfunksjon0000'],
  class: 'dataset',
  __tree__: {
    version: '2.0',
    class: 'dataset',
    label: '12362: Utgifter til tjenesteområdene, kommunekonsern, etter art, år, region og funksjon',
    role: {
      time: ['Tid'],
      geo: ['KOKkommuneregion0000'],
      metric: ['ContentsCode'],
      classification: ['KOKart0000', 'KOKfunksjon0000'],
    },
    id: ['KOKart0000', 'Tid', 'KOKkommuneregion0000', 'ContentsCode', 'KOKfunksjon0000'],
    size: [1, 1, 1, 1, 8],
    dimension: {
      KOKart0000: {
        label: 'art',
        category: { index: { AGD10: 0 }, label: { AGD10: 'Brutto driftsutgifter på funksjon/tjenesteområde' } },
      },
      Tid: {
        label: 'år',
        category: { index: { '2024': 0 }, label: { '2024': '2024' } },
      },
      KOKkommuneregion0000: {
        label: 'region',
        category: { index: { '0301': 0 }, label: { '0301': 'Oslo - Oslove' } },
      },
      ContentsCode: {
        label: 'statistikkvariabel',
        category: {
          index: { KOSandel3501: 0 },
          label: { KOSandel3501: 'Andel av totale utgifter (prosent)' },
          unit: { KOSandel3501: { base: 'prosent', decimals: 1 } },
        },
      },
      KOKfunksjon0000: {
        label: 'funksjon',
        category: {
          index: { FGK12: 0, FGK13: 1, FGK14: 2, FGK1b: 3, FGK2: 4, FGK7: 5, FGK8b: 6, FGK9: 7 },
          label: {
            FGK12: 'Sosialsektoren samlet',
            FGK13: 'Barnevern',
            FGK14: 'Vann, avløp, renovasjon, avfall (VAR)',
            FGK1b: 'Administrasjon, kommune',
            FGK2: 'Kultursektoren, kommune',
            FGK7: 'Barnehage',
            FGK8b: 'Grunnskole',
            FGK9: 'Helse- og omsorg',
          },
        },
      },
    },
    value: [7.5, 2.3, 3.7, 3.8, 4.6, 11.4, 16, 24.8],
  },
  source: 'Statistisk sentralbyrå',
  size: [1, 1, 1, 1, 8],
  value: [7.5, 2.3, 3.7, 3.8, 4.6, 11.4, 16, 24.8],
  status: null,
  role: {
    time: ['Tid'],
    geo: ['KOKkommuneregion0000'],
    metric: ['ContentsCode'],
    classification: ['KOKart0000', 'KOKfunksjon0000'],
  },
  n: 8,
}

export const createMockDataset = (raw: typeof mockPxApi2ResponseOslo): Dataset =>
  ({
    id: raw.id,
    Dimension: (dimensionId: string) => {
      const dimension = raw.__tree__.dimension[dimensionId as keyof typeof raw.__tree__.dimension]

      if (!dimension) return null

      const categoryIndex = dimension.category.index as Record<string, number>
      const categoryLabel = dimension.category.label as Record<string, string>
      const ids = Object.keys(categoryIndex)

      return {
        id: ids,
        Category: (categoryId?: string | number) => {
          if (categoryId === undefined) {
            return ids.map((id) => ({ id: [id], index: categoryIndex[id], label: categoryLabel[id] }))
          }
          const id = typeof categoryId === 'number' ? ids[categoryId] : categoryId
          if (!id || !(id in categoryIndex)) return null
          return { id: [id], index: categoryIndex[id], label: categoryLabel[id] }
        },
      }
    },
    Data: (filter: Array<number | string>) => {
      let flatIndex = 0
      let multiplier = 1
      for (let i = raw.size.length - 1; i >= 0; i--) {
        flatIndex += Number(filter[i] ?? 0) * multiplier
        multiplier *= raw.size[i]
      }
      return (raw.value[flatIndex] ?? null) as never
    },
  }) as unknown as Dataset

export const mockOsloMunicipality = {
  code: '0301',
  displayName: 'Oslo',
  county: { name: 'Oslo' },
  path: '/oslo',
  changes: [],
}

export const mockPxApi2DatasetFormatWithMunicipalityfilter = {
  pxapi: {
    urlOrId: '12362',
    json: '{"selection": [{"variableCode":"ContentsCode","valueCodes": ["KOSandel3501"]},{"variableCode": "Tid","valueCodes": ["2024"]},{"variableCode": "KOKfunksjon0000","valueCodes": ["FGK12","FGK13","FGK14","FGK1b","FGK2","FGK7","FGK8b","FGK9"]},{"variableCode": "KOKkommuneregion0000","valueCodes": ["0301"],"codelist": "agg_KOGkommuneregion000005402"},{"variableCode": "KOKart0000","valueCodes": ["AGD10"]}],"placement": {"heading": ["Tid","KOKkommuneregion0000","ContentsCode","KOKfunksjon0000"],"stub": ["KOKart0000"]}}',
    xAxisLabel: 'KOKfunksjon0000',
    yAxisLabel: 'Tid',
    datasetFilterOptions: {
      municipalityFilter: { municipalityDimension: 'KOKkommuneregion0000' },
      _selected: 'municipalityFilter',
    },
  },
  _selected: 'pxapi',
} as const

export const mockPxApi2DatasetFormatStandalone = {
  pxapi: {
    urlOrId: '12362',
    json: '{"selection": [{  "variableCode": "ContentsCode",  "valueCodes": [    "KOSandel3501"  ]},{  "variableCode": "Tid",  "valueCodes": [    "2024"  ]},{  "variableCode": "KOKfunksjon0000",  "valueCodes": [    "FGK12",    "FGK13",    "FGK14",    "FGK1b",    "FGK2",    "FGK7",    "FGK8b",    "FGK9"  ]},{  "variableCode": "KOKkommuneregion0000",  "valueCodes": ["0301"],  "codelist": "agg_KOGkommuneregion000005402"},{  "variableCode": "KOKart0000",  "valueCodes": [    "AGD10"  ]}],"placement": {"heading": [  "Tid",  "KOKkommuneregion0000",  "ContentsCode",  "KOKfunksjon0000"],"stub": [  "KOKart0000"]}}',
    xAxisLabel: 'KOKfunksjon0000',
    yAxisLabel: 'Tid',
    datasetFilterOptions: undefined,
  },
  _selected: 'pxapi',
} as const

export const mockHighchartContent = {
  data: {
    graphType: 'column',
  },
}

export const resultingCategories = [
  'Sosialsektoren samlet',
  'Barnevern',
  'Vann, avløp, renovasjon, avfall (VAR)',
  'Administrasjon, kommune',
  'Kultursektoren, kommune',
  'Barnehage',
  'Grunnskole',
  'Helse- og omsorg',
]

export const resultingDataSeries = [7.5, 2.3, 3.7, 3.8, 4.6, 11.4, 16, 24.8]
