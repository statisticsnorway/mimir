import * as XLSX from 'xlsx'

/**
 * Eksporterer en HTML-tabell til Excel.
 *
 * @param tableId - ID-en til HTML-tabellen som skal eksporteres.
 * @param fileName - Navnet på den eksporterte Excel-filen (inkludert .xlsx).
 * @param sheetName - Navnet på arket i Excel-filen.
 */
export const exportTableToExcel = (
  tableId: string,
  fileName: string = 'table_export.xlsx',
  sheetName: string = 'Sheet1'
): void => {
  const table = document.getElementById(tableId)

  if (!table) {
    console.error(`Tabellen med ID '${tableId}' ble ikke funnet.`)
    return
  }

  // Konverter tabellen til en Excel-arbeidsbok
  const workbook = XLSX.utils.table_to_book(table, {
    sheet: sheetName,
    raw: true, // Bevarer colspan og rowspan riktig
  })

  // Eksporter arbeidsboken til en Excel-fil
  XLSX.writeFile(workbook, fileName)
}
