import * as XLSX from 'xlsx'

interface TableExport {
  tableElement: HTMLTableElement
  fileName?: string
}

export const exportTableToExcel = ({ tableElement, fileName = 'tabell.xlsx' }: TableExport): void => {
  const sheetName = 'Sheet1'
  const workbook = XLSX.utils.table_to_book(tableElement, {
    sheet: sheetName,
    raw: true,
  })

  const worksheet = workbook.Sheets[sheetName]
  for (const cell in worksheet) {
    // Check if SheetJS worksheet cell object has a value and that the cell isn't a SheetJS special property/metadata
    if (worksheet.hasOwnProperty(cell) && cell[0] !== '!') {
      const cellValue = worksheet[cell].v.replace(/\s/g, '').replace(/,/g, '.')
      if (cellValue !== '') {
        if (!isNaN(Number(cellValue))) {
          worksheet[cell].v = parseFloat(cellValue.toLocaleString('nb-NO'))
          worksheet[cell].t = 'n'
        }
      }
    }
  }

  XLSX.writeFile(workbook, fileName)
}
