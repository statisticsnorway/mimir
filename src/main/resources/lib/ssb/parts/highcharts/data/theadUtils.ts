import { type PreliminaryData, type TableRowUniform } from '/lib/types/xmlParser'
import * as util from '/lib/util'

export function isPreliminaryDataCell(cell: unknown): cell is PreliminaryData {
  return typeof cell === 'object' && cell !== null && 'content' in cell
}

function readCellText(cell: unknown): string | undefined {
  if (typeof cell === 'string') return cell.trim() || undefined
  if (isPreliminaryDataCell(cell)) return String(cell.content ?? '').trim() || undefined
  return undefined
}

function looksLikeTimePeriod(text?: string): boolean {
  if (!text) return false
  // Matches 19xx or 20xx anywhere in the string
  return /\b(19|20)\d{2}\b/.test(text)
}

export function getTimePeriodFromThead(thead: Array<TableRowUniform>): string | undefined {
  const rows = thead?.[0]?.tr
  if (!rows?.length) return undefined

  const firstRow = rows[0]
  const firstThs = firstRow?.th ? util.data.forceArray(firstRow.th) : []
  if (!firstThs.length) return undefined

  // If there are multiple header rows, treat the first row as a time period only
  // when it contains a grouped header (colspan > 1) that looks like a time period.
  if (rows.length > 1) {
    const colspanCell = firstThs.find((c) => isPreliminaryDataCell(c) && Number(c.colspan) > 1)

    const text = readCellText(colspanCell)
    return looksLikeTimePeriod(text) ? text : undefined
  }

  // Single header row: treat as time period only when it looks like a time period
  if (firstThs.length === 1) {
    const text = readCellText(firstThs[0])
    return looksLikeTimePeriod(text) ? text : undefined
  }

  return undefined
}
