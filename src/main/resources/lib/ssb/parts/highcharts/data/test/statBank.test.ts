import { describe, expect, test as it, jest, beforeEach } from '@jest/globals'

import { type Content } from '@enonic-types/lib-portal'
import { type RequestWithCode } from '/lib/types/municipalities'
import { seriesAndCategoriesFromJsonStat } from '/lib/ssb/parts/highcharts/data/statBank'
import { type Highchart } from '../../../../../../site/content-types'
import {
  createMockDataset,
  mockPxApi2ResponseOslo,
  mockPxApi2DatasetFormatWithMunicipalityfilter,
  mockPxApi2DatasetFormatStandalone,
  mockHighchartContent,
  mockOsloMunicipality,
  resultingDataSeries,
  resultingCategories,
} from './mockData'

const mockHighchart = mockHighchartContent as unknown as Content<Highchart>

// ==================== MOCKS ====================

jest.mock(
  '/lib/ssb/repo/dataset',
  () => ({
    DataSource: {
      STATBANK_API: 'statbankApi',
      PXAPI: 'pxapi',
      TBPROCESSOR: 'tbprocessor',
      STATBANK_SAVED: 'statbankSaved',
      DATASET: 'dataset',
      KLASS: 'klass',
      HTMLTABLE: 'htmlTable',
    },
  }),
  { virtual: true }
)

jest.mock(
  '/lib/ssb/dataset/klass/municipalities',
  () => ({
    getMunicipality: jest.fn(() => mockOsloMunicipality),
  }),
  { virtual: true }
)

const mockReq = {} as RequestWithCode
const dataset = createMockDataset(mockPxApi2ResponseOslo)

// ==================== TESTS ====================

describe('parts -> highcharts -> data -> statbank', () => {
  describe('seriesAndCategoriesFromJsonStat()', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('with pxapi2 as source', () => {
      describe('standalone highchart (no municipality filter)', () => {
        it('returns one series with correct name from yAxis (Tid)', async () => {
          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatStandalone
          )

          expect(result?.series).toHaveLength(1)
          expect(result?.series[0].name).toBe('2024')
        })

        it('returns one data series with correct values', async () => {
          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatStandalone
          )

          expect(result?.series[0].data).toEqual(resultingDataSeries)
        })

        it('returns correct categories from xAxis (KOKfunksjon0000)', async () => {
          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatStandalone
          )

          expect(result?.categories).toHaveLength(8)
          expect(result?.categories).toEqual(resultingCategories)
        })
      })

      describe('highchart with municipality filter for Oslo', () => {
        it('returns undefined when getMunicipality returns undefined', async () => {
          const { getMunicipality } = await import('/lib/ssb/dataset/klass/municipalities')
          jest.mocked(getMunicipality).mockReturnValueOnce(undefined)

          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatWithMunicipalityfilter
          )

          expect(result).toBeUndefined()
        })

        it('returns one series with correct name from yAxis (Tid)', async () => {
          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatStandalone
          )

          expect(result?.series).toHaveLength(1)
          expect(result?.series[0].name).toBe('2024')
        })

        it('returns one data series with correct values', async () => {
          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatStandalone
          )

          expect(result?.series[0].data).toEqual(resultingDataSeries)
        })

        it('returns correct categories from xAxis (KOKfunksjon0000)', async () => {
          const result = seriesAndCategoriesFromJsonStat(
            mockReq,
            mockHighchart,
            dataset,
            mockPxApi2DatasetFormatStandalone
          )

          expect(result?.categories).toHaveLength(8)
          expect(result?.categories).toEqual(resultingCategories)
        })
      })
    })
  })
})
