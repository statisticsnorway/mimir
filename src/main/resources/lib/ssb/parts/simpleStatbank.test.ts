import { beforeEach, describe, expect, jest, test as it } from '@jest/globals'
import { getStatbankApiData } from '/lib/ssb/parts/simpleStatbank'
import { fetchStatbankApiDataQuery } from '/lib/ssb/dataset/statbankApi/statbankApi'

jest.mock('jsonstat-toolkit/import.mjs', () => ({
  __esModule: true,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: (rawDataset: any) => ({
    Dataset: () => ({
      Dimension: (dimensionCode: string) => {
        const dimension = rawDataset?.dimension?.[dimensionCode]
        if (!dimension?.category?.index) {
          return undefined
        }

        const id = Object.entries(dimension.category.index)
          .sort((a, b) => Number(a[1]) - Number(b[1]))
          .map(([categoryCode]) => categoryCode)

        return {
          id,
          Category: (categoryCode: string) => {
            const index = dimension.category.index?.[categoryCode]
            if (index === undefined) {
              return null
            }

            return {
              label: dimension.category.label?.[categoryCode] ?? '',
              index,
            }
          },
        }
      },
      Data: (selector: Record<string, string> | number) => {
        if (typeof selector === 'number') {
          return { value: rawDataset?.value?.[selector] }
        }

        // Return without value to exercise pxapi v2 fallback path in getStatbankApiData.
        return {}
      },
    }),
  }),
}))

jest.mock('/lib/ssb/dataset/statbankApi/statbankApi', () => ({
  fetchStatbankApiDataQuery: jest.fn(),
}))

jest.mock('/lib/ssb/utils/utils', () => ({
  createHumanReadableFormat: jest.fn((value: number) => value.toString().replace(/\./, ',')),
}))

jest.mock('/lib/ssb/utils/language', () => ({
  localizeTimePeriod: jest.fn((time: string) => `${time}`),
}))

const mockLog = {
  error: jest.fn(),
  warning: jest.fn(),
}

describe('parts -> simpleStatbank', () => {
  beforeEach(async () => {
    jest.clearAllMocks()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).log = mockLog
  })
  describe('getStatbankApiData()', () => {
    it('returns correct result for pxapi v2', () => {
      jest.mocked(fetchStatbankApiDataQuery).mockReturnValue(mockPxApi2Dataset)
      const url = 'https://data.ssb.no/api/pxwebapi/v2/tables/05375/data?lang=no&outputFormat=json-stat2'
      const result = getStatbankApiData('Alder', url, mockPxApi2Query.query)

      expect(result).toEqual({
        data: [
          { displayName: '0 år', dataCode: '000', value: '83,23', time: '2025' },
          { displayName: '1 år', dataCode: '001', value: '82,43', time: '2025' },
          { displayName: '2 år', dataCode: '002', value: '81,44', time: '2025' },
          { displayName: '3 år', dataCode: '003', value: '80,45', time: '2025' },
          { displayName: '4 år', dataCode: '004', value: '79,46', time: '2025' },
          { displayName: '5 år', dataCode: '005', value: '78,46', time: '2025' },
          { displayName: '6 år', dataCode: '006', value: '77,46', time: '2025' },
          { displayName: '7 år', dataCode: '007', value: '76,47', time: '2025' },
          { displayName: '8 år', dataCode: '008', value: '75,47', time: '2025' },
          { displayName: '9 år', dataCode: '009', value: '74,48', time: '2025' },
        ],
      })

      expect(fetchStatbankApiDataQuery).toHaveBeenCalledWith(url, mockPxApi2Query.query)
    })

    it('returns correct result for statbank api', () => {
      jest.mocked(fetchStatbankApiDataQuery).mockReturnValue(mockStatbankApiData)
      const result = getStatbankApiData('Alder', '05375', mockStatbankQuery.query)

      expect(result).toEqual({
        data: [
          { displayName: '0 år', dataCode: '000', value: '82,63', time: '2022' },
          { displayName: '1 år', dataCode: '001', value: '81,78', time: '2022' },
          { displayName: '2 år', dataCode: '002', value: '80,8', time: '2022' },
          { displayName: '3 år', dataCode: '003', value: '79,81', time: '2022' },
          { displayName: '4 år', dataCode: '004', value: '78,82', time: '2022' },
          { displayName: '5 år', dataCode: '005', value: '77,82', time: '2022' },
          { displayName: '6 år', dataCode: '006', value: '76,83', time: '2022' },
          { displayName: '7 år', dataCode: '007', value: '75,84', time: '2022' },
          { displayName: '8 år', dataCode: '008', value: '74,84', time: '2022' },
          { displayName: '9 år', dataCode: '009', value: '73,84', time: '2022' },
        ],
      })

      expect(fetchStatbankApiDataQuery).toHaveBeenCalledWith('05375', mockStatbankQuery.query)
    })

    it('returns correct result for pxapi v2 with municipality filter', () => {
      jest.mocked(fetchStatbankApiDataQuery).mockReturnValue(mockPxApi2DatasetWithMunicipality)
      const url = 'https://data.ssb.no/api/pxwebapi/v2/tables/03174/data?lang=no&outputFormat=json-stat2'
      const result = getStatbankApiData('Region', url, mockPxApi2QueryWithMunicipality.query)

      expect(result).toEqual({
        data: [{ displayName: 'Oslo - Oslove', dataCode: 'K-0301', value: '7', time: '2026' }],
      })

      expect(fetchStatbankApiDataQuery).toHaveBeenCalledWith(url, mockPxApi2QueryWithMunicipality.query)
    })

    it('returns correct result for statbank api with municipality filter', () => {
      jest.mocked(fetchStatbankApiDataQuery).mockReturnValue(mockStatbankDatasetWithMunicipality)
      const result = getStatbankApiData('Region', '03174', mockStatbankQueryWithMunicipality.query)

      expect(result).toEqual({
        data: [{ displayName: 'Halden', dataCode: 'K-3101', value: '849', time: '2024' }],
      })

      expect(fetchStatbankApiDataQuery).toHaveBeenCalledWith('03174', mockStatbankQueryWithMunicipality.query)
    })
  })
})

// MOCKS
const mockStatbankQuery = {
  query:
    '{"query":[{"code":"Kjonn","selection":{"filter":"item","values":["0"]}},{"code":"Tid","selection":{"filter":"item","values":["2022"]}}],"response":{"format":"json-stat2"}}',
}

const mockStatbankApiData = {
  version: '2.0',
  class: 'dataset',
  label: '05375:Forventetgjenståendelevetid,etterkjønn,alder,statistikkvariabelogår',
  source: 'Statistisksentralbyrå',
  updated: '2026-03-12T07:00:00Z',
  role: { time: ['Tid'], metric: ['ContentsCode'] },
  id: ['Kjonn', 'Alder', 'ContentsCode', 'Tid'],
  size: [1, 10, 1, 1],
  dimension: {
    Kjonn: {
      label: 'kjønn',
      category: { index: { '0': 0 }, label: { '0': 'Beggekjønn' } },
      extension: { elimination: true, eliminationValueCode: '0', show: 'value' },
      link: { describedby: [{ extension: { Kjonn: 'urn:ssb:classification:klass:2' } }] },
    },
    Alder: {
      label: 'alder',
      category: {
        index: {
          '000': 0,
          '001': 1,
          '002': 2,
          '003': 3,
          '004': 4,
          '005': 5,
          '006': 6,
          '007': 7,
          '008': 8,
          '009': 9,
        },
        label: {
          '000': '0 år',
          '001': '1 år',
          '002': '2 år',
          '003': '3 år',
          '004': '4 år',
          '005': '5 år',
          '006': '6 år',
          '007': '7 år',
          '008': '8 år',
          '009': '9 år',
        },
      },
      extension: { elimination: false, show: 'value' },
    },
    ContentsCode: {
      label: 'statistikkvariabel',
      category: {
        index: { Levetid: 0 },
        label: { Levetid: 'Forventetgjenståendelevetid' },
        unit: { Levetid: { base: 'år', decimals: 2 } },
      },
      extension: {
        elimination: false,
        refperiod: { Levetid: 'År' },
        show: 'value',
        measuringType: { Levetid: 'Flow' },
        priceType: { Levetid: 'NotApplicable' },
        adjustment: { Levetid: 'None' },
      },
    },
    Tid: {
      label: 'år',
      category: { index: { '2022': 0 }, label: { '2022': '2022' } },
      extension: { elimination: false, show: 'code' },
    },
  },
  value: [82.63, 81.78, 80.8, 79.81, 78.82, 77.82, 76.83, 75.84, 74.84, 73.84],
}

const mockStatbankQueryWithMunicipality = {
  query:
    '{"query":[{"code":"Region","selection":{"filter":"agg:KommSummer","values":["K-3101"]}},{"code":"BygnType","selection":{"filter":"item","values":["991"]}},{"code":"Tid","selection":{"filter":"item","values":["2024"]}}],"response":{"format":"json-stat2"}}',
}

const mockStatbankDatasetWithMunicipality = {
  version: '2.0',
  class: 'dataset',
  label: '03174:Eksisterendebygningsmasse.Fritidsbygg,etterregion,bygningstype,statistikkvariabelogår',
  role: { time: ['Tid'], geo: ['Region'], metric: ['ContentsCode'] },
  id: ['Region', 'BygnType', 'ContentsCode', 'Tid'],
  size: [1, 1, 1, 1],
  dimension: {
    Region: {
      label: 'region',
      category: { index: { 'K-3101': 0 }, label: { 'K-3101': 'Halden' } },
    },
    BygnType: {
      label: 'bygningstype',
      category: { index: { '991': 0 }, label: { '991': 'Hytter,sommerhusoglignendefritidsbygg' } },
    },
    ContentsCode: {
      label: 'statistikkvariabel',
      category: {
        index: { Fritidshus: 0 },
        label: { Fritidshus: 'Eksisterendebygninger' },
        unit: { Fritidshus: { base: 'bygninger', decimals: 0 } },
      },
    },
    Tid: {
      label: 'år',
      category: { index: { '2024': 0 }, label: { '2024': '2024' } },
    },
  },
  value: [849],
}

const mockPxApi2Query = {
  query:
    '{"selection":[{"variableCode":"ContentsCode","valueCodes":["*"]},{"variableCode":"Tid","valueCodes":["2025"]},{"variableCode":"Alder","valueCodes":["*"]},{"variableCode":"Kjonn","valueCodes":["0"]}],"placement":{"heading":["ContentsCode","Tid","Kjonn"],"stub":["Alder"]}}',
}

const mockPxApi2Dataset = {
  version: '2.0',
  class: 'dataset',
  label: '05375:Forventetgjenståendelevetid,etteralder,årogkjønn',
  source: 'Statistisksentralbyrå',
  updated: '2026-03-12T07:00:00Z',
  role: { time: ['Tid'], metric: ['ContentsCode'] },
  id: ['Alder', 'ContentsCode', 'Tid', 'Kjonn'],
  size: [10, 1, 1, 1],
  dimension: {
    Alder: {
      label: 'alder',
      category: {
        index: {
          '000': 0,
          '001': 1,
          '002': 2,
          '003': 3,
          '004': 4,
          '005': 5,
          '006': 6,
          '007': 7,
          '008': 8,
          '009': 9,
        },
        label: {
          '000': '0 år',
          '001': '1 år',
          '002': '2 år',
          '003': '3 år',
          '004': '4 år',
          '005': '5 år',
          '006': '6 år',
          '007': '7 år',
          '008': '8 år',
          '009': '9 år',
        },
      },
      extension: { elimination: false, show: 'value' },
    },
    ContentsCode: {
      label: 'statistikkvariabel',
      category: {
        index: { Levetid: 0 },
        label: { Levetid: 'Forventetgjenståendelevetid' },
        unit: { Levetid: { base: 'år', decimals: 2 } },
      },
      extension: {
        elimination: false,
        refperiod: { Levetid: 'År' },
        show: 'value',
        measuringType: { Levetid: 'Flow' },
        priceType: { Levetid: 'NotApplicable' },
        adjustment: { Levetid: 'None' },
        alternativeText: { Levetid: 'Forventetgjenståendelevetid' },
      },
    },
    Tid: {
      label: 'år',
      category: { index: { '2025': 0 }, label: { '2025': '2025' } },
      extension: { elimination: false, show: 'code' },
    },
    Kjonn: {
      label: 'kjønn',
      category: { index: { '0': 0 }, label: { '0': 'Beggekjønn' } },
      extension: { elimination: true, eliminationValueCode: '0', show: 'value' },
      link: { describedby: [{ extension: { Kjonn: 'urn:ssb:classification:klass:2' } }] },
    },
  },
  value: [83.23, 82.43, 81.44, 80.45, 79.46, 78.46, 77.46, 76.47, 75.47, 74.48],
}

const mockPxApi2QueryWithMunicipality = {
  query:
    '{"selection":[{"variableCode":"ContentsCode","valueCodes":["*"]},{"variableCode":"Tid","valueCodes":["2026"]},{"variableCode":"Region","valueCodes":["K-0301"],"codelist":"agg_KommSummer"},{"variableCode":"BygnType","valueCodes":["162-163"]}],"placement":{"heading":["ContentsCode","Tid","BygnType"],"stub":["Region"]}}',
}

const mockPxApi2DatasetWithMunicipality = {
  version: '2.0',
  class: 'dataset',
  label: '03174:Eksisterendebygningsmasse.Fritidsbygg,etterregion,årogbygningstype',
  source: 'Statistisksentralbyrå',
  role: { time: ['Tid'], geo: ['Region'], metric: ['ContentsCode'] },
  id: ['Region', 'ContentsCode', 'Tid', 'BygnType'],
  size: [1, 1, 1, 1],
  dimension: {
    Region: {
      label: 'region',
      note: [
        '[Selisteoverendringerideregionaleinndelingene](https://www.ssb.no/offentlig-sektor/kommunekatalog/endringer-i-de-regionale-inndelingene).',
      ],
      category: { index: { 'K-0301': 0 }, label: { 'K-0301': 'Oslo - Oslove' } },
      extension: { elimination: false, show: 'code_value' },
      link: {
        describedby: [{ extension: { Region: 'urn:ssb:classification:klass:104urn:ssb:classification:klass:131' } }],
      },
    },
    ContentsCode: {
      label: 'statistikkvariabel',
      category: {
        index: { Fritidshus: 0 },
        label: { Fritidshus: 'Eksisterendebygninger' },
        unit: { Fritidshus: { base: 'bygninger', decimals: 0 } },
      },
    },
    Tid: {
      label: 'år',
      category: { index: { '2026': 0 }, label: { '2026': '2026' } },
      extension: { elimination: false, show: 'code' },
    },
    BygnType: {
      label: 'bygningstype',
      category: {
        index: { '162-163': 0 },
        label: { '162-163': 'Helårsboligerogvåningshusbenyttetsomfritidsbolig' },
      },
      extension: { elimination: false, show: 'value' },
      link: { describedby: [{ extension: { BygnType: 'urn:ssb:classification:klass:31' } }] },
    },
  },
  value: [7],
}
