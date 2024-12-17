import * as XLSX from 'xlsx'

interface TableExport {
  tableElement: HTMLTableElement
  fileName?: string
}

export const exportTableToExcel = ({ tableElement, fileName = 'tabell.xlsx' }: TableExport): void => {
  const workbook = XLSX.utils.table_to_book(tableElement, {
    sheet: 'Sheet1',
    raw: true,
  })

  XLSX.writeFile(workbook, fileName)
}
