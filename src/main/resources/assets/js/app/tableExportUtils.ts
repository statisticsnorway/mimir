import ExcelJS from 'exceljs'
import { type TableView } from '/lib/types/partTypes/table'
import { type TableRowUniform, type PreliminaryData } from '/lib/types/xmlParser'

export interface ExportTableTypes {
  tableName?: string
  tableData: Partial<TableView>
  language?: string
}

function parseCellValue(cellValue: string | number | PreliminaryData) {
  if (typeof cellValue === 'object' && Array.isArray(cellValue)) {
    return cellValue.join(' ')
  }
  if (cellValue !== '' && typeof cellValue !== 'object') {
    const cellValueNumber = cellValue.replace(/\s/g, '')
    if (typeof cellValue === 'number' || !isNaN(Number(cellValueNumber))) {
      return parseFloat(cellValueNumber.toLocaleString('nb-NO'))
    }
    if (typeof cellValue === 'string') {
      return cellValue.trim()
    }
    return cellValue
  }
  return ''
}

function getRowData(row: TableRowUniform) {
  const rowData: Array<string | number> = []
  ;(Object.keys(row) as ('th' | 'td')[]).flatMap((key) => {
    if (row[key]) {
      row[key].map((cellValue: string | number | PreliminaryData) => {
        rowData.push(parseCellValue(cellValue.content || cellValue))
      })
    }
    if (row[key].length === 0) {
      rowData.push('')
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
        const startRow = worksheetRow.number
        const startCol = colIndex
        const endCol = colIndex + colspan - 1
        const endRow = worksheetRow.number + rowspan - 1

        console.log('cell value ' + JSON.stringify(cellValue, null, 2))
        console.log('start column ' + startCol)
        console.log('end column ' + endCol)
        console.log('end row ' + endRow)
        console.log('worksheet row number ' + startRow)

        // Merge cells horizontally and/or vertically
        worksheet.mergeCells(startRow, startCol, endRow, endCol)

        colIndex = endCol + 1
      } else {
        colIndex++
      }
    })
  })
}

export async function exportTableToExcel({ tableName, tableData }: ExportTableTypes) {
  const { thead, tbody } = tableData

  const workbook = new ExcelJS.Workbook()
  const worksheet = workbook.addWorksheet('Sheet1')

  const theadRow = thead[0].tr
  const tbodyRow = tbody[0].tr

  if (theadRow.length) {
    // console.log(theadRow)
    theadRow.map((row: TableRowUniform) => {
      const worksheetRow = worksheet.addRow(getRowData(row))
      mergeWorksheetCells(row, worksheet, worksheetRow)
    })
  }

  if (tbodyRow.length) {
    // console.log(tbodyRow)
    tbodyRow.map((row: TableRowUniform) => {
      worksheet.addRow(getRowData(row))
      // console.log(getRowData(row))
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
