import ExcelJS from 'exceljs'
import { type TableView } from '/lib/types/partTypes/table'
import { type TableRowUniform, type PreliminaryData } from '/lib/types/xmlParser'

export interface ExportTableTypes {
  tableName?: string
  tableData: Partial<TableView>
  language: string
}

function parseCellValue(cellValue: string | number, language: string) {
  const localeString = language === 'en' ? 'en-GB' : 'nb-NO'
  if (cellValue !== '') {
    if (typeof cellValue === 'string') {
      if (!isNaN(parseFloat(cellValue))) {
        return parseFloat(cellValue)
      }
      return cellValue
    }
    return cellValue.toLocaleString(localeString)
  }
  return ''
}

function getRowData(row: TableRowUniform, language: string) {
  const rowData: Array<string | number> = []
  ;(Object.keys(row) as ('th' | 'td')[]).forEach((key) => {
    row[key].forEach((cellValue: string | number | PreliminaryData) => {
      rowData.push(parseCellValue(cellValue.content || cellValue || '', language))
    })
  })
  return rowData
}

export async function exportTableToExcel({ tableName, tableData, language }: ExportTableTypes) {
  if (!tableData) {
    console.error('Missing Table Data')
  }
  const { thead, tbody } = tableData

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  if (thead?.length) {
    thead.forEach((thead: TableView['thead']) => {
      thead.tr.forEach((row: TableRowUniform) => {
        const worksheetRow = worksheet.addRow(getRowData(row, language))

        // Merge cells if colspan or rowspan is present
        let colIndex = 1
        row.th?.forEach((th) => {
          if (th.colspan) {
            const start = colIndex
            const end = colIndex + parseInt(th.colspan) - 1
            worksheet.mergeCells(worksheetRow.number, start, worksheetRow.number, end)
            colIndex = end + 1
          } else {
            colIndex++
          }
        })
      })
    })
  }

  if (tbody?.length) {
    tbody.forEach((tbody: TableView['tbody']) => {
      tbody.tr.forEach((row: TableRowUniform) => {
        worksheet.addRow(getRowData(row, language))
      })
    })
  }

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

export async function exportTableToCSV({ tableName, tableData, language }: ExportTableTypes) {
  console.log('tableName: ' + JSON.stringify(tableName))
  console.log(JSON.stringify(tableData, null, 2))
  console.log(language)
}
