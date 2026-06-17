import { describe, expect, test as it, jest, beforeEach } from '@jest/globals'

import { type Content } from '@enonic-types/lib-portal'
import { type RequestWithCode } from '/lib/types/municipalities'
import { seriesAndCategoriesFromJsonStat } from '/lib/ssb/parts/highcharts/data/statBank'
import { type Highchart } from '/site/content-types'
import {
  createMockDataset,
  mockPxApi2ResponseOslo,
  mockPxApi2DatasetFormatWithMunicipalityfilter,
  mockPxApi2DatasetFormatStandalone,
  mockHighchartContent,
  mockOsloMunicipality,
  mockStatbankResponseOslo,
  mockStatbankDatasetFormatWithMunicipalityfilter,
  mockStatbankDatasetFormatStandalone,
  expectedResultPxApi2,
  expectedResultStatbankApi,
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
const pxapi2Dataset = createMockDataset(mockPxApi2ResponseOslo)
const statbankDataset = createMockDataset(mockStatbankResponseOslo)

// ==================== TESTS ====================

describe('parts -> highcharts -> data -> statbank', () => {
  describe('seriesAndCategoriesFromJsonStat()', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    describe('with pxapi2 as source', () => {
      it('returns correct result for standalone highchart (no municipality filter)', async () => {
        const result = seriesAndCategoriesFromJsonStat(
          mockReq,
          mockHighchart,
          pxapi2Dataset,
          mockPxApi2DatasetFormatStandalone
        )

        expect(result).toEqual(expectedResultPxApi2)
      })

      it('returns undefined when getMunicipality returns undefined', async () => {
        const { getMunicipality } = await import('/lib/ssb/dataset/klass/municipalities')
        jest.mocked(getMunicipality).mockReturnValueOnce(undefined)

        const result = seriesAndCategoriesFromJsonStat(
          mockReq,
          mockHighchart,
          pxapi2Dataset,
          mockPxApi2DatasetFormatWithMunicipalityfilter
        )

        expect(result).toBeUndefined()
      })

      it('returns correct result for highchart with municipality filter', async () => {
        const result = seriesAndCategoriesFromJsonStat(
          mockReq,
          mockHighchart,
          pxapi2Dataset,
          mockPxApi2DatasetFormatWithMunicipalityfilter
        )

        expect(result).toEqual(expectedResultPxApi2)
      })
    })

    describe('with statbankApi as source', () => {
      it('returns correct result for standalone highchart (no municipality filter)', async () => {
        const result = seriesAndCategoriesFromJsonStat(
          mockReq,
          mockHighchart,
          statbankDataset,
          mockStatbankDatasetFormatStandalone
        )

        expect(result).toEqual(expectedResultStatbankApi)
      })

      it('returns undefined when getMunicipality returns undefined', async () => {
        const { getMunicipality } = await import('/lib/ssb/dataset/klass/municipalities')
        jest.mocked(getMunicipality).mockReturnValueOnce(undefined)

        const result = seriesAndCategoriesFromJsonStat(
          mockReq,
          mockHighchart,
          statbankDataset,
          mockStatbankDatasetFormatWithMunicipalityfilter
        )

        expect(result).toBeUndefined()
      })

      it('returns correct result for highchart with municipality filter', async () => {
        const result = seriesAndCategoriesFromJsonStat(
          mockReq,
          mockHighchart,
          statbankDataset,
          mockStatbankDatasetFormatWithMunicipalityfilter
        )

        expect(result).toEqual(expectedResultStatbankApi)
      })
    })
  })
})
