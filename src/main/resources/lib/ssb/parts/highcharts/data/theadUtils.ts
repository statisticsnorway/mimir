import { type PreliminaryData, type TableRowUniform, type TableCellUniform } from '/lib/types/xmlParser'
import * as util from '/lib/util'

export function isPreliminaryDataCell(cell: unknown): cell is PreliminaryData {
  return typeof cell === 'object' && cell !== null && 'content' in cell
}

function readCellText(cell: unknown): string | undefined {
  if (typeof cell === 'string') return cell.trim() || undefined
  if (isPreliminaryDataCell(cell)) return String(cell.content ?? '').trim() || undefined
  return undefined
}

function rowHasColspanGroupHeader(row: TableCellUniform): boolean {
  const ths = row?.th ? util.data.forceArray(row.th) : []
  return ths.some((cell) => isPreliminaryDataCell(cell) && Number(cell.colspan) > 1)
}

export function getColumnHeaderRowFromThead(thead: TableRowUniform[]): TableCellUniform | undefined {
  const headerRows = thead?.[0]?.tr
  if (!headerRows?.length) return undefined

  const first = headerRows[0]
  const second = headerRows[1]

  // Use the second header row if the first one only contains a grouped header (colspan),
  // otherwise fall back to the first row (default case).
  return second && rowHasColspanGroupHeader(first) ? second : first
}

export function getTimePeriodFromThead(thead: Array<TableRowUniform>): string | undefined {
  const rows = thead?.[0]?.tr
  if (!rows?.length) return undefined

  const firstRow = rows[0]
  const firstThs = firstRow?.th ? util.data.forceArray(firstRow.th) : []
  if (!firstThs.length) return undefined

  // If there are multiple header rows, the first row represents the time period (typically a colspan group header)
  if (rows.length > 1) {
    const colspanCell = firstThs.find((c) => isPreliminaryDataCell(c) && Number(c.colspan) > 1)
    return readCellText(colspanCell ?? firstThs[0])
  }

  // Single header row: treat as time period only when it is the only header cell
  if (firstThs.length === 1) return readCellText(firstThs[0])

  return undefined
}
