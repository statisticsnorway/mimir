type HighchartsTableOptions = {
  timePeriod?: string
  defaultShowAsTable?: boolean
}

export function formatHighchartsTable(
  tableWrapperElement: HTMLElement | null | undefined,
  opts?: HighchartsTableOptions
) {
  if (!tableWrapperElement) return

  const tableElement = tableWrapperElement.firstElementChild
  if (!(tableElement instanceof HTMLTableElement)) return

  tableWrapperElement.classList.add('ssb-table-wrapper')
  tableElement.classList.add('statistics', 'ssb-table')

  addTimePeriodHeaderToTable(tableElement, opts?.timePeriod)

  tableElement.setAttribute('tabindex', '0')

  if (opts?.defaultShowAsTable) {
    tableElement.removeAttribute('tabindex')
  }

  setTimeout(() => {
    tableElement.setAttribute('tabindex', '0')
  }, 1000)
}

function addTimePeriodHeaderToTable(tableElement: HTMLElement, timePeriod?: string) {
  console.log('Adding time period header to table', timePeriod)
  if (!timePeriod) return

  const thead = tableElement.querySelector('thead')
  if (!thead) return

  const rows = thead.querySelectorAll('tr')
  const headerRow = rows[0]
  if (!headerRow) return

  // Avoid duplicating if already patched
  const alreadyHasGroupRow = rows.length >= 2 && (rows[0]?.children?.[1]?.textContent ?? '').trim() === timePeriod

  if (alreadyHasGroupRow) return

  const headerCells = Array.from(headerRow.cells)
  if (headerCells.length < 2) return

  const categoryText = headerCells[0].textContent ?? ''
  const seriesCount = headerCells.length - 1

  const groupRow = document.createElement('tr')

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
