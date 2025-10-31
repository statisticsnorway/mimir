import { exportHighchartsToExcel } from '/lib/ssb/utils/tableExportUtils'
import { downloadAsXLSX } from './Highmap'

jest.mock('highcharts', () => ({}))
jest.mock('highcharts/modules/accessibility', () => jest.fn())
jest.mock('highcharts/modules/exporting', () => jest.fn())
jest.mock('highcharts/modules/offline-exporting', () => jest.fn())
jest.mock('highcharts/modules/export-data', () => jest.fn())
jest.mock('highcharts/modules/map', () => jest.fn())

jest.mock('/lib/ssb/utils/tableExportUtils', () => ({
  exportHighchartsToExcel: jest.fn(),
}))

describe('downloadAsXLSX', () => {
  let mockContext

  beforeEach(() => {
    jest.clearAllMocks()

    mockContext = {
      getDataRows: jest.fn().mockReturnValue([
        ['Header1', 'Header2'],
        ['Data1', 'Data2'],
        ['Data3', 'Data4'],
      ]),
    }
  })

  test('should call exportHighchartsToExcel with correct data when title is provided', () => {
    const downloadFn = downloadAsXLSX('Test Chart')
    downloadFn.call(mockContext)

    expect(exportHighchartsToExcel).toHaveBeenCalledWith({
      rows: [
        ['Data1', 'Data2'],
        ['Data3', 'Data4'],
      ],
      fileName: 'Test Chart.xlsx',
    })
  })

  test('should use default filename when no title is provided', () => {
    const downloadFn = downloadAsXLSX()
    downloadFn.call(mockContext)

    expect(exportHighchartsToExcel).toHaveBeenCalledWith({
      rows: [
        ['Data1', 'Data2'],
        ['Data3', 'Data4'],
      ],
      fileName: 'graf.xlsx',
    })
  })

  test('should slice off header highmap data row correctly', () => {
    const downloadFn = downloadAsXLSX('test')
    downloadFn.call(mockContext)

    const calledArgs = exportHighchartsToExcel.mock.calls[0][0]
    expect(calledArgs.rows).toHaveLength(2)
    expect(calledArgs.rows).not.toContainEqual(['Header1', 'Header2'])
  })
})
