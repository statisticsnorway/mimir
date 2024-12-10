import ExcelJS from 'exceljs'
import { TableView } from '/lib/types/partTypes/table'

export interface ExportTableTypes {
  tableName?: string
  tableData: Partial<TableView>
}

function prepTableDataValues({ tableData }: ExportTableTypes) {
  const { thead, tbody } = tableData

  return {
    thead,
    tbody,
  }
}

/* TODO:
 * Include necessary options (or implement directly) just like in the tableExport plugin?
 * Feature toggling
 */
export async function exportTableToExcel({ tableName, tableData }: ExportTableTypes) {
  if (!tableData) {
    console.error('Missing Table Data')
  }

  const workbook = new ExcelJS.Workbook()
  // const worksheet = workbook.addWorksheet(tableName ?? 'tabell')

  const prepTableData = prepTableDataValues(tableData)
  console.log(prepTableData)

  // TODO: Implement logic

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
  })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  document.body.appendChild(a)
  a.href = url
  a.download = `${tableName ?? 'tabell'}.xlsx`
  a.click()

  URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export async function exportTableToCSV({ tableName, tableData }: ExportTableTypes) {
  console.log('tableName: ' + JSON.stringify(tableName))
  console.log(JSON.stringify(tableData, null, 2))
}
