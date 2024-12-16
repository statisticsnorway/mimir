import React, { useState, useRef } from 'react'
import {
  Dropdown,
  Link,
  Button,
  Table as SSBTable,
  TableHead,
  TableBody,
  TableFooter,
  TableRow,
  TableCell,
} from '@statisticsnorway/ssb-component-library'
import { default as isEmpty } from 'ramda/es/isEmpty'
import { NumericFormat } from 'react-number-format'
import { Alert } from 'react-bootstrap'
import { type TableProps } from '/lib/types/partTypes/table'
import { PreliminaryData, type TableCellUniform } from '/lib/types/xmlParser'
import { exportTableToExcel } from '/lib/ssb/utils/tableExportUtils'

declare global {
  interface Window {
    downloadTableFile: (element: HTMLDivElement | null, options: unknown) => void
  }
}

function Table(props: TableProps) {
  const [currentTable, setCurrentTable] = useState(
    props.paramShowDraft && props.draftExist ? props.tableDraft : props.table
  )
  const [fetchUnPublished, setFetchUnPublished] = useState(props.paramShowDraft)
  const showPreviewToggle =
    props.showPreviewDraft && (!props.pageTypeStatistic || (props.paramShowDraft && props.pageTypeStatistic))
  const tableWrapperRef = useRef<HTMLDivElement>(null)

  function trimValue(value: string | number) {
    return typeof value === 'string' ? value.trim() : value
  }

  function formatNumber(value: string | number) {
    const language = props.table.language
    const decimalSeparator = language === 'en' ? '.' : ','
    value = trimValue(value)
    if (value && (typeof value === 'number' || !isNaN(Number(value)))) {
      const decimals = value.toString().includes('.') ? value.toString().split('.')[1].length : 0
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
    return value
  }

  function addDownloadTableDropdown(mobile: boolean) {
    if (props.downloadTableLabel && props.downloadTableTitle && props.downloadTableOptions) {
      const downloadTable = (item: { id: string }) => {
        if (item.id === 'downloadTableAsCSV') downloadTableAsCSV()
        if (item.id === 'downloadTableAsXLSX') downloadTableAsExcel()
      }

      return (
        <div className={`download-table-container ${mobile ? 'd-flex d-lg-none' : 'd-none d-lg-flex'}`}>
          <Dropdown
            selectedItem={props.downloadTableTitle}
            items={props.downloadTableOptions}
            ariaLabel={props.downloadTableLabel}
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
    exportTableToExcel('complex-table', 'my_complex_table.xlsx', 'DataSheet')
    /* if (window.downloadTableFile) {
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
    } */
  }

  function addCaption() {
    const { caption } = currentTable
    if (caption) {
      const hasNoteRefs = typeof caption === 'object'
      return (
        <>
          {hasNoteRefs ? caption.content : caption}
          {hasNoteRefs && addNoteRefs(caption.noterefs)}
        </>
      )
    }
    return null
  }

  function createTable() {
    const { tableClass } = props.table
    return (
      <SSBTable
        id='complex-table'
        className={tableClass}
        caption={addCaption()}
        dataNoteRefs={currentTable.caption?.noterefs}
        checkIsOverflowing={props.checkIsOverflowing}
      >
        {currentTable.thead?.map((t, index) => (
          <React.Fragment key={index}>
            {addThead(index)}
            {addTbody(index)}
          </React.Fragment>
        ))}
        {addTFoot()}
      </SSBTable>
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
            const current = footnotes?.find((footnote) => footnote.noteid === note)
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
    return (Object.keys(row) as ('th' | 'td')[]).flatMap((keyName) => {
      const value = row[keyName]
      if (keyName === 'th') return createHeadTh(value)
      if (keyName === 'td') return createHeadTd(value)
      return []
    })
  }

  function createRowsHead(rows: TableCellUniform[]) {
    return rows?.map((row, i) => <TableRow key={i}>{createHeaderCell(row)}</TableRow>)
  }

  function createRowsBody(rows: TableCellUniform[]) {
    return rows?.map((row, i) => (
      <TableRow key={i}>
        {createBodyTh(row)}
        {createBodyTd(row)}
      </TableRow>
    ))
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
    return (Object.keys(row) as ('th' | 'td')[]).flatMap((key) => {
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
      return []
    })
  }

  function createBodyTd(row: TableCellUniform) {
    return (Object.keys(row) as ('th' | 'td')[]).flatMap((keyName) => {
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
      return []
    })
  }

  function addNoteRefs(noteRefId: string) {
    if (noteRefId) {
      const noteRefs = currentTable.noteRefs
      const noteIDs = noteRefId.split(' ')
      const notesToReturn = noteRefs!.reduce((acc, current, index) => {
        return noteIDs.includes(current) ? [...acc, index] : acc
      }, [] as number[])

      if (notesToReturn.length) {
        return <sup>{notesToReturn.map((noteRef) => `${noteRef + 1} `)}</sup>
      }
    }
    return null
  }

  function addStandardSymbols() {
    if (props.standardSymbol && props.standardSymbol.href && props.standardSymbol.text) {
      return (
        <Link href={props.standardSymbol.href} standAlone>
          {props.standardSymbol.text}
        </Link>
      )
    }
    return null
  }

  function addPreviewButton() {
    if (showPreviewToggle && !props.pageTypeStatistic) {
      return (
        <Button primary onClick={toggleDraft} className='mb-2'>
          {!fetchUnPublished ? 'Vis upubliserte tall' : 'Vis publiserte tall'}
        </Button>
      )
    }
    return null
  }

  function toggleDraft() {
    setFetchUnPublished(!fetchUnPublished)
    setCurrentTable(!fetchUnPublished && props.draftExist ? props.tableDraft : props.table)
  }

  function addPreviewInfo() {
    if (props.showPreviewDraft) {
      if (fetchUnPublished && props.draftExist) {
        return <Alert variant='info'>Tallene i tabellen nedenfor er upublisert</Alert>
      } else if (fetchUnPublished && !props.draftExist) {
        return <Alert variant='warning'>Finnes ikke upubliserte tall for denne tabellen</Alert>
      }
    }
    return null
  }

  function renderSources() {
    if ((props.sourceListTables && props.sourceListTables.length > 0) || (props.sources && props.sources.length > 0)) {
      return (
        <div className='row source'>
          <div className='w-100 col-12'>
            <span className='source-title'>
              <strong>{props.sourceLabel}</strong>
            </span>
          </div>
          {props.sourceListTables.map((tableId) => (
            <div key={tableId} className='source-link col-lg-3 col-12'>
              <Link href={`${props.statBankWebUrl}/table/${tableId}`} standAlone>
                {`${props.sourceTableLabel} ${tableId}`}
              </Link>
            </div>
          ))}
          {props.sources.map((source) => (
            <div key={source.url} className='source-link col-lg-3 col-12'>
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
      {addPreviewButton()}
      {!isEmpty(currentTable) ? (
        <>
          <div className='d-none searchabletext'>
            <span>{props.hiddenTitle}</span>
          </div>
          <div className='container border-0'>
            {addDownloadTableDropdown(false)}
            {addPreviewInfo()}
            <div className='table-wrapper searchabletext' ref={tableWrapperRef}>
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

export default Table
