import React, { useState, useRef, useEffect } from 'react'
import {
  Dropdown,
  Link,
  Button,
  Table,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
} from '@statisticsnorway/ssb-component-library'
import { default as isEmpty } from 'ramda/es/isEmpty'
import { NumericFormat } from 'react-number-format'
import { Alert } from 'react-bootstrap'
import { type TableProps } from '../../lib/types/partTypes/table'
import { PreliminaryData, type TableCellUniform } from '../../lib/types/xmlParser'

declare global {
  interface Window {
    downloadTableFile: (element: HTMLDivElement | null, options: DownloadTableOptions) => void
  }
}

interface DownloadTableOptions {
  type: 'csv' | 'xlsx'
  fileName: string
  csvSeparator?: string
  csvEnclosure?: string
  tfootSelector?: string
  numbers?: {
    html: {
      decimalMark: string
      thousandsSeparator: string
    }
    output: {
      decimalMark: string
      thousandsSeparator: string
    }
  }
}

function CustomTable({
  downloadTableLabel,
  downloadTableTitle,
  downloadTableOptions,
  table,
  tableDraft,
  standardSymbol,
  sources,
  sourceLabel,
  sourceListTables,
  sourceTableLabel,
  statBankWebUrl,
  hiddenTitle,
  showPreviewDraft,
  paramShowDraft,
  draftExist,
  pageTypeStatistic,
}: TableProps) {
  const [currentTable, setCurrentTable] = useState(paramShowDraft && draftExist ? tableDraft : table)
  const [fetchUnPublished, setFetchUnPublished] = useState(paramShowDraft)

  const showPreviewToggle = showPreviewDraft && (!pageTypeStatistic || (paramShowDraft && pageTypeStatistic))

  const tableWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const widthCheckInterval = setInterval(() => {
      widthCheck()
    }, 250)
    window.addEventListener('resize', widthCheck)
    return () => {
      clearInterval(widthCheckInterval)
      window.removeEventListener('resize', widthCheck)
    }
  }, [])

  function widthCheck() {
    // No longer need to manage scroll controls, so this can be simplified
  }

  function trimValue(value: string | number) {
    if (value && typeof value === 'string') {
      return value.trim()
    }
    return value
  }

  function formatNumber(value: string | number) {
    const language = table.language
    const decimalSeparator = language === 'en' ? '.' : ','
    value = trimValue(value)
    if (value) {
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(Number(value)))) {
        const decimals = value.toString().indexOf('.') > -1 ? value.toString().split('.')[1].length : 0
        return (
          <NumericFormat
            value={Number(value)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={decimals}
            fixedDecimalScale
          />
        )
      }
    }
    return value
  }

  function addDownloadTableDropdown(mobile: boolean) {
    if (downloadTableLabel && downloadTableTitle && downloadTableOptions) {
      const downloadTable = (item: { id: string }) => {
        if (item.id === 'downloadTableAsCSV') {
          downloadTableAsCSV()
        }

        if (item.id === 'downloadTableAsXLSX') {
          downloadTableAsExcel()
        }
      }

      return (
        <div className={`download-table-container ${mobile ? 'd-flex d-lg-none' : 'd-none d-lg-flex'}`}>
          <Dropdown
            selectedItem={downloadTableTitle}
            items={downloadTableOptions}
            ariaLabel={downloadTableLabel}
            onSelect={downloadTable}
          />
        </div>
      )
    }
    return null
  }

  function downloadTableAsCSV() {
    if (window.downloadTableFile) {
      window.downloadTableFile(tableWrapperRef.current, {
        type: 'csv',
        fileName: 'tabell',
        csvSeparator: ';',
        csvEnclosure: '',
        tfootSelector: '',
      })
    }
  }

  function downloadTableAsExcel() {
    if (window.downloadTableFile) {
      window.downloadTableFile(tableWrapperRef.current, {
        type: 'xlsx',
        fileName: 'tabell',
        numbers: {
          html: {
            decimalMark: ',',
            thousandsSeparator: ' ',
          },
          output: {
            decimalMark: '.',
            thousandsSeparator: '',
          },
        },
      })
    }
  }

  function addCaption() {
    const { caption } = currentTable
    if (caption) {
      const hasNoteRefs = typeof caption === 'object'
      return hasNoteRefs ? caption.content : caption
    }
    return null
  }

  function createTable() {
    const { tableClass } = table

    return (
      <Table className={tableClass} caption={addCaption()} dataNoteRefs={table.caption?.noterefs}>
        {table.thead?.map((t, index) => (
          <React.Fragment key={index}>
            {addThead(index)}
            {addTbody(index)}
          </React.Fragment>
        ))}
        {addTFoot()}
      </Table>
    )
  }

  function addThead(index: number) {
    return <TableHead>{createRowsHead(currentTable.thead![index].tr)}</TableHead>
  }

  function addTbody(index: number) {
    return <TableBody>{createRowsBody(currentTable.tbody![index].tr)}</TableBody>
  }

  function renderCorrectionNotice() {
    if (currentTable.tfoot?.correctionNotice) {
      return (
        <TableRow className='correction-notice'>
          <TableCell colSpan={100}>{currentTable.tfoot.correctionNotice}</TableCell>
        </TableRow>
      )
    }
    return null
  }

  function addTFoot() {
    const { footnotes, correctionNotice } = currentTable.tfoot || {}

    const noteRefs = currentTable.noteRefs

    if ((noteRefs && noteRefs.length > 0) || correctionNotice) {
      return (
        <TableFooter>
          {noteRefs?.map((note, index) => {
            const current = footnotes && footnotes.find((footnote) => footnote.noteid === note)
            if (current) {
              return (
                <TableRow key={index} className='footnote'>
                  <TableCell colSpan={100}>
                    <sup>{index + 1}</sup>
                    {current.content}
                  </TableCell>
                </TableRow>
              )
            }
            return null
          })}
          {renderCorrectionNotice()}
        </TableFooter>
      )
    }
    return null
  }

  function createHeaderCell(row: TableCellUniform) {
    return Object.keys(row)
      .map((keyName: 'th' | 'td') => {
        const value = row[keyName]
        if (keyName === 'th') {
          return createHeadTh(value)
        } else if (keyName === 'td') {
          return createHeadTd(value)
        }
        return [] // Ensure all paths return a value
      })
      .flat() // Ensure a flat array
  }

  function createRowsHead(rows: TableCellUniform[]) {
    if (rows) {
      return rows.map((row, i) => <TableRow key={i}>{createHeaderCell(row)}</TableRow>)
    }
    return null
  }

  function createRowsBody(rows: TableCellUniform[]) {
    if (rows) {
      return rows.map((row, i) => (
        <TableRow key={i}>
          {createBodyTh(row)}
          {createBodyTd(row)}
        </TableRow>
      ))
    }
    return null
  }

  function createHeadTh(value: (string | number | PreliminaryData)[]) {
    return value.map((cellValue, i) => {
      if (typeof cellValue === 'object') {
        if (Array.isArray(cellValue)) {
          return (
            <TableCell key={i} type='th'>
              {cellValue.join(' ')}
            </TableCell>
          )
        } else {
          return (
            <TableCell
              key={i}
              type='th'
              className={cellValue.class}
              rowSpan={cellValue.rowspan}
              colSpan={cellValue.colspan}
              scope={cellValue.rowspan || cellValue.colspan ? 'colgroup' : 'col'}
            >
              {trimValue(cellValue.content)}
              {addNoteRefs(cellValue.noterefs)}
            </TableCell>
          )
        }
      } else {
        return (
          <TableCell key={i} type='th' scope='col'>
            {trimValue(cellValue)}
          </TableCell>
        )
      }
    })
  }

  function createHeadTd(value: (string | number | PreliminaryData)[]) {
    return value.map((cellValue, i) => {
      if (typeof cellValue === 'object') {
        return (
          <TableCell key={i} className={cellValue.class} rowSpan={cellValue.rowspan} colSpan={cellValue.colspan}>
            {trimValue(cellValue.content)}
            {addNoteRefs(cellValue.noterefs)}
          </TableCell>
        )
      } else {
        return <TableCell key={i}>{trimValue(cellValue)}</TableCell>
      }
    })
  }

  function createBodyTh(row: TableCellUniform) {
    return Object.keys(row)
      .map((key: 'th' | 'td') => {
        const value = row[key]
        if (key === 'th') {
          return value.map((cellValue, i) => {
            if (typeof cellValue === 'object') {
              return (
                <TableCell
                  key={i}
                  type='th'
                  className={cellValue.class}
                  rowSpan={cellValue.rowspan}
                  colSpan={cellValue.colspan}
                  scope={cellValue.rowspan || cellValue.colspan ? 'rowgroup' : 'row'}
                >
                  {trimValue(cellValue.content)}
                  {addNoteRefs(cellValue.noterefs)}
                </TableCell>
              )
            } else {
              return (
                <TableCell key={i} type='th' scope='row'>
                  {trimValue(cellValue)}
                </TableCell>
              )
            }
          })
        }
        return null // Ensure all paths return a value
      })
      .flat() // Ensure a flat array
  }

  function createBodyTd(row: TableCellUniform) {
    return Object.keys(row)
      .map((keyName: 'th' | 'td') => {
        const value = row[keyName]
        if (keyName === 'td') {
          return value.map((cellValue, i) => {
            if (typeof cellValue === 'object') {
              return (
                <TableCell key={i} className={cellValue.class} rowSpan={cellValue.rowspan} colSpan={cellValue.colspan}>
                  {formatNumber(cellValue.content)}
                </TableCell>
              )
            } else {
              return <TableCell key={i}>{formatNumber(cellValue)}</TableCell>
            }
          })
        }
        return null // Ensure all paths return a value
      })
      .flat() // Ensure a flat array
  }

  function addNoteRefs(noteRefId: string) {
    if (noteRefId) {
      const noteRefs = currentTable.noteRefs
      const noteIDs = noteRefId.split(' ')
      const notesToReturn = noteRefs!.reduce((acc, current, index) => {
        return noteIDs.some((element) => element === current) ? acc.concat(index) : acc
      }, [] as number[])

      if (notesToReturn) {
        return <sup>{notesToReturn.map((noteRef) => `${noteRef + 1} `)}</sup>
      }
    }
    return null
  }

  function addStandardSymbols() {
    if (standardSymbol && standardSymbol.href && standardSymbol.text) {
      return (
        <Link href={standardSymbol.href} standAlone>
          {standardSymbol.text}
        </Link>
      )
    }
    return null
  }

  function addPreviewButton() {
    if (showPreviewToggle && !pageTypeStatistic) {
      return (
        <Button primary onClick={toggleDraft}>
          {!fetchUnPublished ? 'Vis upubliserte tall' : 'Vis publiserte tall'}
        </Button>
      )
    }
    return null
  }

  function toggleDraft() {
    setFetchUnPublished(!fetchUnPublished)
    setCurrentTable(!fetchUnPublished && draftExist ? tableDraft : table)
  }

  function addPreviewInfo() {
    if (showPreviewDraft) {
      if (fetchUnPublished && draftExist) {
        return <Alert variant='info'>Tallene i tabellen nedenfor er upublisert</Alert>
      } else if (fetchUnPublished && !draftExist) {
        return <Alert variant='warning'>Finnes ikke upubliserte tall for denne tabellen</Alert>
      }
    }
    return null
  }

  function renderSources() {
    if ((sourceListTables && sourceListTables.length > 0) || (sources && sources.length > 0)) {
      return (
        <div className='row mt-5 source'>
          <div className='w-100 col-12'>
            <span className='source-title'>
              <strong>{sourceLabel}</strong>
            </span>
          </div>
          {sourceListTables.map((tableId, index) => (
            <div key={index} className='col-lg-3 col-12'>
              <Link href={`${statBankWebUrl}/table/${tableId}`} standAlone>
                {`${sourceTableLabel} ${tableId}`}
              </Link>
            </div>
          ))}
          {sources.map((source, index) => (
            <div key={index} className='col-lg-3 col-12'>
              {source.url && source.urlText && (
                <Link href={source.url} standAlone>
                  {source.urlText}
                </Link>
              )}
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <section className='xp-part part-table'>
      {!isEmpty(currentTable) ? (
        <>
          <div className='d-none searchabletext'>
            <span>{hiddenTitle}</span>
          </div>
          <div className='container border-0'>
            {addPreviewButton()}
            {addDownloadTableDropdown(false)}
            {addPreviewInfo()}
            <div className='table-wrapper searchabletext' onScroll={widthCheck} ref={tableWrapperRef}>
              {createTable()}
            </div>
            {addDownloadTableDropdown(true)}
            {addStandardSymbols()}
            {renderSources()}
          </div>
        </>
      ) : (
        <div>
          <p>Ingen tilknyttet Tabell</p>
        </div>
      )}
    </section>
  )
}

export default CustomTable
