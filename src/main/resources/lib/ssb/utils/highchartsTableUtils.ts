export function formatHighchartsTable(
  tableWrapperElement: HTMLElement | null | undefined,
  timePeriod?: string
): HTMLTableElement | undefined {
  if (!tableWrapperElement) return

  const tableElement = tableWrapperElement.firstElementChild
  if (!(tableElement instanceof HTMLTableElement)) return

  tableWrapperElement.classList.add('ssb-table-wrapper')
  tableElement.classList.add('statistics', 'ssb-table')

  addTimePeriodHeaderToTable(tableElement, timePeriod)

  return tableElement
}

function addTimePeriodHeaderToTable(tableElement: HTMLElement, timePeriod?: string) {
  /**
   * Mutates the rendered Highcharts data table to add a grouped timePeriod header row,
   * but only when Highcharts does NOT already show the time period in the table header.
   *
   * Rule:
   * - If the first header row already contains `timePeriod` (e.g. single-year tables like "2024"),
   *   do nothing to avoid duplicate time period headers.
   *
   * Intended for tables where the first header row contains: [category, ...series].
   * (Time period extraction is handled separately via getTimePeriodFromThead().)
   */
  if (!timePeriod) return

  const thead = tableElement.querySelector('thead')
  if (!thead) return

  const rows = Array.from(thead.querySelectorAll('tr'))

  // Only support tables with max two header rows
  if (rows.length > 2) return

  const headerRow = rows[0] as HTMLTableRowElement | undefined
  if (!headerRow) return

  const headerCells = Array.from(headerRow.cells)
  if (headerCells.length < 2) return

  // If the header already contains the same value as timePeriod,
  // the year is already rendered correctly by Highcharts.
  const hasTimePeriodAlready = headerCells.some((c) => (c.textContent ?? '').trim() === timePeriod)
  if (hasTimePeriodAlready) return

  const categoryText = headerCells[0].textContent ?? ''
  const seriesCount = headerCells.length - 1

  const groupRow = document.createElement('tr')

  // Move the category header to the group row and span both rows.
  // The original category cell is removed from the header row below.
  const categoryTh = document.createElement('th')
  categoryTh.textContent = categoryText
  categoryTh.setAttribute('rowspan', '2')
  groupRow.appendChild(categoryTh)

  const periodTh = document.createElement('th')
  periodTh.textContent = timePeriod
  periodTh.setAttribute('colspan', String(seriesCount))
  groupRow.appendChild(periodTh)

  headerRow.before(groupRow)

  // Remove the duplicated first header cell from the original header row
  headerCells[0].remove()
}
