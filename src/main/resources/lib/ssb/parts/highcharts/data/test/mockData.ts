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

export const mockStatbankResponseOslo = {
  version: '2.0',
  class: 'dataset',
  label: '12362: Utgifter til tjenesteområdene, kommunekonsern, etter region, funksjon, art, statistikkvariabel og år',
  source: 'Statistisk sentralbyrå',
  updated: '2026-06-15T06:00:00Z',
  note: [
    'Tabellen gir en oversikt over de mest brukte regnskapsbegrepene fra drifts- og investeringsregnskapet per enkeltfunksjon og funksjonene gruppert per tjenesteområde. Data vises i prosent av totale utgifter, i kroner per innbygger og som absolutte tall i 1000 kr.',
    'Vær oppmerksom på at summen av andelene for utgifter til tjenesteområdene ikke blir 100% for noen av utgiftsbegrepene i denne tabellen. Dette skyldes både at enkelte funksjoner inngår i flere av tjenesteområdene (benevnt som FGK1a..FGK17) mens andre funksjoner ikke inngår i noe tjenesteområde, samt at artsomfanget er ulikt i teller og nevner for enkelte av begrepene.  \r\nFunksjonsomfang og artsomfang i teller ved utregning av andelene:\nFunksjonene 121, 130, 221, 222, 261, 381 og 386 i Eiendomsforvaltning (FGK6a) inngår også i Administrasjon, kommune (FGK1b), i gruppering FGK7 Barnehage, i gruppering FGK8 Grunnskolesektor og i gruppering FGK2 Kultursektoren. Finansfunksjonene (800..899) inngår ikke i noe tjenesteområde.  \r\nArtene 710 og 729 trekkes ut av begrepene Korrigerte brutto driftsutgifter og Brutto driftsutgifter.  \r\nFunksjonsomfang og artsomfang i nevner ved utregning av andelene:  \nAlle funksjoner inngår. Artene 710 og 729 inngår i Brutto driftsutgifter. I Korrigerte brutto driftsutgifter inngår art 710 mens art 729 trekkes ut.',
    'Det er brudd i tidsserien for KOSTRA-gruppene mellom 2019 og 2020 når det gjelder inndelingen etter folkemengde, bundne kostnader og frie disponible inntekter. Se [kodelister for KOSTRA-gruppene i 2019 og 2020](https://www.ssb.no/klass/klassifikasjoner/112/versjoner).',
    'For forklaringer av særskilte forhold i dataene, justeringer i publiserte tall, brudd i tidsserier og kommunesammenslåinger, se [Strukturelle forklaringer og rettelogg](https://www.ssb.no/kostra/rettinger-i-tidligere-ars-publiserte-data).',
    'Fra og med 2017 fører Oslo de fleste utgifter knyttet til vei på funksjon 332 Kommunale veier.',
  ],
  role: {
    time: ['Tid'],
    geo: ['KOKkommuneregion0000'],
    metric: ['ContentsCode'],
  },
  id: ['KOKkommuneregion0000', 'KOKfunksjon0000', 'KOKart0000', 'ContentsCode', 'Tid'],
  size: [1, 8, 1, 1, 1],
  dimension: {
    KOKkommuneregion0000: {
      label: 'region',
      category: {
        index: {
          '0301': 0,
        },
        label: {
          '0301': 'Oslo - Oslove',
        },
      },
    },
    KOKfunksjon0000: {
      label: 'funksjon',
      category: {
        index: {
          FGK12: 0,
          FGK13: 1,
          FGK14: 2,
          FGK1b: 3,
          FGK2: 4,
          FGK7: 5,
          FGK8b: 6,
          FGK9: 7,
        },
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
    KOKart0000: {
      label: 'art',
      category: {
        index: {
          AGD10: 0,
        },
        label: {
          AGD10: 'Brutto driftsutgifter på funksjon/tjenesteområde',
        },
      },
    },
    ContentsCode: {
      label: 'statistikkvariabel',
      category: {
        index: {
          KOSandel3501: 0,
        },
        label: {
          KOSandel3501: 'Andel av totale utgifter (prosent)',
        },
        unit: {
          KOSandel3501: {
            base: 'prosent',
            decimals: 1,
          },
        },
      },
    },
    Tid: {
      label: 'år',
      category: {
        index: {
          '2024': 0,
        },
        label: {
          '2024': '2024',
        },
      },
    },
  },
  value: [7.5, 2.3, 3.7, 3.8, 4.6, 11.4, 16, 24.8],
}

type MockRawDataset = {
  id: string[]
  size: number[]
  value: number[]
  __tree__?: {
    dimension?: Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }>
  }
  dimension?: Record<string, { category: { index: Record<string, number>; label: Record<string, string> } }>
}

export const createMockDataset = (raw: MockRawDataset): Dataset =>
  ({
    id: raw.id,
    Dimension: (dimensionId: string) => {
      const dimensions = raw.__tree__?.dimension ?? raw.dimension
      const dimension = dimensions?.[dimensionId]

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

export const mockStatbankDatasetFormatWithMunicipalityfilter = {
  statbankApi: {
    urlOrId: '12362',
    json: '{  "query": [{  "code": "KOKkommuneregion0000",  "selection": {    "filter": "agg_single:KOGkommuneregion000005402",    "values": [      "0301"    ]  }},{  "code": "KOKfunksjon0000",  "selection": {    "filter": "item",    "values": [       "FGK12",      "FGK13",      "FGK14",      "FGK1b",      "FGK2",      "FGK7",      "FGK8b",      "FGK9"    ]  }},{  "code": "KOKart0000",  "selection": {    "filter": "item",    "values": [      "AGD10"    ]  }},{  "code": "ContentsCode",  "selection": {    "filter": "item",    "values": [      "KOSandel3501"    ]  }},{  "code": "Tid",  "selection": {    "filter": "item",    "values": [      "2024"    ]  }}],"response": {"format": "json-stat2"}}',
    xAxisLabel: 'KOKfunksjon0000',
    yAxisLabel: 'Tid',
    datasetFilterOptions: {
      municipalityFilter: { municipalityDimension: 'KOKkommuneregion0000' },
      _selected: 'municipalityFilter',
    },
  },
  _selected: 'statbankApi',
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

export const mockStatbankDatasetFormatStandalone = {
  statbankApi: {
    urlOrId: '12362',
    json: '{  "query": [{  "code": "KOKkommuneregion0000",  "selection": {    "filter": "agg_single:KOGkommuneregion000005402",    "values": [      "0301"    ]  }},{  "code": "KOKfunksjon0000",  "selection": {    "filter": "item",    "values": [       "FGK12",      "FGK13",      "FGK14",      "FGK1b",      "FGK2",      "FGK7",      "FGK8b",      "FGK9"    ]  }},{  "code": "KOKart0000",  "selection": {    "filter": "item",    "values": [      "AGD10"    ]  }},{  "code": "ContentsCode",  "selection": {    "filter": "item",    "values": [      "KOSandel3501"    ]  }},{  "code": "Tid",  "selection": {    "filter": "item",    "values": [      "2024"    ]  }}],"response": {"format": "json-stat2"}}',
    xAxisLabel: 'KOKfunksjon0000',
    yAxisLabel: 'Tid',
    datasetFilterOptions: undefined,
  },
  _selected: 'statbankApi',
} as const

export const mockHighchartContent = {
  data: {
    graphType: 'column',
  },
}

export const expectedResultPxApi2 = {
  series: [{ name: '2024', data: [7.5, 2.3, 3.7, 3.8, 4.6, 11.4, 16, 24.8] }],
  categories: [
    'Sosialsektoren samlet',
    'Barnevern',
    'Vann, avløp, renovasjon, avfall (VAR)',
    'Administrasjon, kommune',
    'Kultursektoren, kommune',
    'Barnehage',
    'Grunnskole',
    'Helse- og omsorg',
  ],
}

export const expectedResultStatbankApi = {
  series: [
    { name: 'Sosialsektoren samlet', y: 7.5, data: [7.5] },
    { name: 'Barnevern', y: 2.3, data: [2.3] },
    {
      name: 'Vann, avløp, renovasjon, avfall (VAR)',
      y: 3.7,
      data: [3.7],
    },
    { name: 'Administrasjon, kommune', y: 3.8, data: [3.8] },
    { name: 'Kultursektoren, kommune', y: 4.6, data: [4.6] },
    { name: 'Barnehage', y: 11.4, data: [11.4] },
    { name: 'Grunnskole', y: 16, data: [16] },
    { name: 'Helse- og omsorg', y: 24.8, data: [24.8] },
  ],
  categories: ['2024'],
}
