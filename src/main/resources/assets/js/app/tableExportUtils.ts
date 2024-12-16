import ExcelJS from 'exceljs'
import { type TableView } from '/lib/types/partTypes/table'
import { type TableRowUniform, type PreliminaryData } from '/lib/types/xmlParser'

export interface ExportTableTypes {
  tableName?: string
  tableData: Partial<TableView>
  language?: string
}

function parseCellValue(cellValue: string | number | PreliminaryData, language?: string) {
  const localeString = language === 'en' ? 'en-EN' : 'nb-NO'
  if (typeof cellValue === 'object' && Array.isArray(cellValue)) {
    return cellValue.join(' ')
  }
  if (cellValue !== '' && typeof cellValue !== 'object') {
    const cellValueNumber = cellValue.replace(/\s/g, '')
    if (typeof cellValue === 'number' || !isNaN(Number(cellValueNumber))) {
      return parseFloat(cellValueNumber.toLocaleString(localeString))
    }
    if (typeof cellValue === 'string') {
      return cellValue.trim()
    }
    return cellValue
  }
  return ''
}

function getRowData(row: TableRowUniform, language?: string) {
  const rowData: Array<string | number> = []
  ;(Object.keys(row) as ('th' | 'td')[]).forEach((key) => {
    if (row[key]) {
      row[key].forEach((cellValue: string | number | PreliminaryData) => {
        rowData.push(parseCellValue(cellValue.content || cellValue, language))
      })
    }
  })
  return rowData
}

function mergeWorksheetCells(row: TableRowUniform, worksheet: ExcelJS.Worksheet, worksheetRow: ExcelJS.Row) {
  let colIndex = 1
  ;(Object.keys(row) as ('th' | 'td')[]).forEach((key) => {
    row[key].forEach((cellValue: string | number | PreliminaryData) => {
      if (typeof cellValue === 'object' && (cellValue.colspan || cellValue.rowspan)) {
        const colspan = parseInt(cellValue.colspan || '1', 10)
        const rowspan = parseInt(cellValue.rowspan || '1', 10)
        const startCol = colIndex
        const endCol = colIndex + colspan - 1

        // Merge cells horizontally and/or vertically
        worksheet.mergeCells(worksheetRow.number, startCol, worksheetRow.number + rowspan - 1, endCol)

        colIndex = endCol + 1
      } else {
        colIndex++
      }
    })
  })
}

export async function exportTableToExcel({ tableName, tableData, language }: ExportTableTypes) {
  if (!tableData) {
    console.error('Missing Table Data')
  }
  const { thead, tbody } = tableData

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  console.log(thead)
  if (thead?.length) {
    thead.forEach((thead: TableView['thead']) => {
      thead.tr.forEach((row: TableRowUniform) => {
        console.log(getRowData(row, language))
        const worksheetRow = worksheet.addRow(getRowData(row, language))
        mergeWorksheetCells(row, worksheet, worksheetRow)
      })
    })
  }

  if (tbody?.length) {
    console.log(tbody)
    tbody.forEach((tbody: TableView['tbody']) => {
      tbody.tr.forEach((row: TableRowUniform) => {
        worksheet.addRow(getRowData(row, language))
        console.log(getRowData(row, language))
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
