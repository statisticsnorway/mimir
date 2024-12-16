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
  ;(Object.keys(row) as ('th' | 'td')[]).flatMap((key) => {
    if (row[key]) {
      row[key].map((cellValue: string | number | PreliminaryData) => {
        rowData.push(parseCellValue(cellValue.content || cellValue, language))
      })
    }
  })
  return rowData
}

function mergeWorksheetCells(row: TableRowUniform, worksheet: ExcelJS.Worksheet, worksheetRow: ExcelJS.Row) {
  let colIndex = 1
  ;(Object.keys(row) as ('th' | 'td')[]).flatMap((key) => {
    row[key].map((cellValue: string | number | PreliminaryData) => {
      if (typeof cellValue === 'object' && (cellValue.colspan || cellValue.rowspan)) {
        const colspan = parseInt(cellValue.colspan || '1', 10)
        const rowspan = parseInt(cellValue.rowspan || '1', 10)
        const startCol = colIndex
        const endCol = colIndex + colspan - 1

        console.log('cell value ' + JSON.stringify(cellValue, null, 2))
        console.log('start column ' + startCol)
        console.log('end column ' + endCol)
        console.log('end row ' + (worksheetRow.number + rowspan - 1))
        console.log('worksheet row number ' + worksheetRow.number)

        // Merge cells horizontally and/or vertically: start row, start column, end row, end column
        worksheet.mergeCells(worksheetRow.number, startCol, worksheetRow.number + rowspan - 1, endCol)

        colIndex = endCol + 1
      } else {
        colIndex++
      }
    })
    console.log('colIndex ' + colIndex)
  })
}

export async function exportTableToExcel({ tableName, tableData, language }: ExportTableTypes) {
  const { thead, tbody } = tableData

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  const theadRow = thead[0].tr
  const tbodyRow = tbody[0].tr

  if (theadRow.length) {
    // console.log(theadRow)
    theadRow.map((row: TableRowUniform) => {
      console.log(getRowData(row, language))
      const rowData = getRowData(row, language)
      const worksheetRow = worksheet.addRow(rowData)
      mergeWorksheetCells(row, worksheet, worksheetRow)
    })
  }

  if (tbodyRow.length) {
    // console.log(tbodyRow)
    tbodyRow.map((row: TableRowUniform) => {
      worksheet.addRow(getRowData(row, language))
      // console.log(getRowData(row, language))
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
