import * as XLSX from 'xlsx'

export const exportTableToExcel = (
  tableElement: HTMLTableElement,
  fileName: string = 'table_export.xlsx',
  sheetName: string = 'Sheet1'
): void => {
  if (!tableElement) {
    console.error('HTML-tabellen er ikke tilgjengelig.')
    return
  }

  // Konverter tabellen til en Excel-arbeidsbok
  const workbook = XLSX.utils.table_to_book(tableElement, {
    sheet: sheetName,
    raw: true, // Bevarer colspan og rowspan riktig
  })

  // Eksporter arbeidsboken til en Excel-fil
  XLSX.writeFile(workbook, fileName)
}
