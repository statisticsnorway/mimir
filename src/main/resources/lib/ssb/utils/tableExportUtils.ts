import * as XLSX from 'xlsx'
import { Title } from '/lib/types/xmlParser'

interface TableExport {
  tableElement: HTMLTableElement
  fileName?: Title | string
}

const sheetName = 'Sheet1'

const createTableWorkbook = (tableElement: TableExport['tableElement']) => {
  return XLSX.utils.table_to_book(tableElement, {
    sheet: sheetName,
    raw: true,
  })
}

export const exportTableToExcel = ({ tableElement, fileName }: TableExport): void => {
  const sheetFileName = fileName ? `${fileName}.xlsx` : 'tabell.xlsx'
  const workbook = createTableWorkbook(tableElement)

  const worksheet = workbook.Sheets[sheetName]
  Object.keys(worksheet).flatMap((cell) => {
    // Check if SheetJS worksheet cell object has a value and that the cell isn't a SheetJS special property/metadata
    if (cell && cell[0] !== '!') {
      const cellValue = worksheet[cell].v.replace(/\s/g, '').replace(/,/g, '.')
      if (cellValue !== '') {
        if (!isNaN(cellValue)) {
          worksheet[cell].v = parseFloat(cellValue)
          worksheet[cell].t = 'n'
        }
      }
    }
  })

  XLSX.writeFile(workbook, sheetFileName)
}

export const exportTableToCSV = ({ tableElement, fileName }: TableExport): void => {
  const sheetFileName = fileName ? `${fileName}.csv` : 'tabell.csv'
  const workbook = createTableWorkbook(tableElement)

  XLSX.writeFile(workbook, sheetFileName, { bookType: 'csv', type: 'string' })
}
