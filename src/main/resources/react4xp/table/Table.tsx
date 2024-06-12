import React, { useState, useRef, useEffect } from 'react'
import { Dropdown, Link, Button } from '@statisticsnorway/ssb-component-library'
import { default as isEmpty } from 'ramda/es/isEmpty'
import { NumericFormat } from 'react-number-format'
import { Alert } from 'react-bootstrap'
import { ChevronLeft, ChevronRight } from 'react-feather'
import { type TableProps } from '../../lib/types/partTypes/table'
import { PreliminaryData, type TableCellUniform } from '../../lib/types/xmlParser'

function Table(props: TableProps) {
  const [prevClientWidth, setPrevClientWidth] = useState(0)
  const [table, setTable] = useState(props.paramShowDraft && props.draftExist ? props.tableDraft : props.table)
  const [fetchUnPublished, setFetchUnPublished] = useState(props.paramShowDraft)

  const showPreviewToggle =
    props.showPreviewDraft && (!props.pageTypeStatistic || (props.paramShowDraft && props.pageTypeStatistic))

  const captionRef = useRef<HTMLTableCaptionElement>(null)
  const tableControlsDesktopRef = useRef<HTMLDivElement>(null)
  const tableControlsMobileRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLTableElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    updateTableControlsDesktop()

    const widthCheckInterval = setInterval(() => {
      widthCheck()
    }, 250)
    window.addEventListener('resize', updateTableControlsDesktop)
    return () => {
      clearInterval(widthCheckInterval)
      window.removeEventListener('resize', updateTableControlsDesktop)
    }
  }, [])

  function widthCheck() {
    if (tableWrapperRef.current?.clientWidth !== prevClientWidth) {
      setPrevClientWidth(tableWrapperRef.current!.clientWidth)
      updateTableControlsDesktop()
    }
  }

  function updateTableControlsDesktop() {
    if (
      !tableWrapperRef.current ||
      !tableControlsDesktopRef.current ||
      !captionRef.current ||
      !tableControlsMobileRef.current
    )
      return

    const controls = tableControlsDesktopRef.current
    const tableWrapper = tableWrapperRef.current
    const left = controls.children.item(0)! as HTMLElement
    const right = controls.children.item(1)! as HTMLElement

    // hide controlls if there is no scrollbar
    if (tableWrapper.scrollWidth > tableWrapper.clientWidth || tableWrapper.clientWidth === 0) {
      controls.classList.remove('d-none')
      tableControlsMobileRef.current.classList.remove('d-none')
      // disable left
      if (tableWrapper.scrollLeft <= 0) {
        left.classList.add('disabled')
      } else {
        left.classList.remove('disabled')
      }

      // disable right
      if (tableWrapper.scrollLeft + tableWrapper.clientWidth >= tableWrapper.scrollWidth) {
        right.classList.add('disabled')
      } else {
        right.classList.remove('disabled')
      }

      // move desktop controls to correct pos
      const captionHalfHeight = captionRef.current.offsetHeight / 2
      const controlsHalfHeight = left.scrollHeight / 2
      left.style.marginTop = `${captionHalfHeight - controlsHalfHeight}px`
      right.style.marginTop = `${captionHalfHeight - controlsHalfHeight}px`
    } else {
      controls.classList.add('d-none')
      tableControlsMobileRef.current.classList.add('d-none')
    }
  }

  function scrollLeft() {
    tableWrapperRef.current!.scrollLeft -= 100
    updateTableControlsDesktop()
  }

  function scrollRight() {
    tableWrapperRef.current!.scrollLeft += 100
    updateTableControlsDesktop()
  }

  function trimValue(value: string | number) {
    if (value && typeof value === 'string') {
      return value.trim()
    }
    return value
  }

  function formatNumber(value: string | number) {
    const language = props.table.language
    const decimalSeparator = language === 'en' ? '.' : ','
    value = trimValue(value)
    if (value) {
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
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
    const { downloadTableLabel, downloadTableTitle, downloadTableOptions } = props

    if (downloadTableLabel && downloadTableTitle && downloadTableOptions) {
      const downloadTable = (item: { id: string }) => {
        if (item.id === 'downloadTableAsCSV') {
          {
            downloadTableAsCSV()
          }
        }

        if (item.id === 'downloadTableAsXLSX') {
          {
            downloadTableAsExcel()
          }
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
  }

  function downloadTableAsCSV() {
    if (window && window.downloadTableFile) {
      window.downloadTableFile(tableRef.current, {
        type: 'csv',
        fileName: 'tabell',
        csvSeparator: ';',
        csvEnclosure: '',
        tfootSelector: '',
      })
    }
  }

  function downloadTableAsExcel() {
    if (window && window.downloadTableFile) {
      window.downloadTableFile(tableRef.current, {
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

  function createTable() {
    const { tableClass } = props.table

    return (
      <table className={tableClass} ref={tableRef}>
        {addCaption()}
        {table.thead!.map((t, index) => {
          return (
            <React.Fragment key={index}>
              {addThead(index)}
              {addTbody(index)}
            </React.Fragment>
          )
        })}
        {addTFoot()}
      </table>
    )
  }

  function addCaption() {
    const { caption } = table
    if (caption) {
      const hasNoteRefs = typeof caption === 'object'
      return (
        <caption data-noterefs={hasNoteRefs ? caption.noterefs : null} ref={captionRef}>
          <div className='caption-text-wrapper'>
            {hasNoteRefs ? caption.content : caption}
            {hasNoteRefs ? addNoteRefs(caption.noterefs) : null}
          </div>
        </caption>
      )
    }
  }

  function createScrollControlsMobile() {
    return (
      <div className='table-controls-mobile' ref={tableControlsMobileRef}>
        <img src={props.iconUrl} />
      </div>
    )
  }

  function createScrollControlsDesktop() {
    return (
      <div className='table-controls-desktop' ref={tableControlsDesktopRef}>
        <span className='me-2' onClick={() => scrollLeft()}>
          <ChevronLeft />
        </span>
        <span onClick={() => scrollRight()}>
          <ChevronRight />
        </span>
      </div>
    )
  }

  function addThead(index: number) {
    return <thead>{createRowsHead(table.thead![index].tr)}</thead>
  }

  function addTbody(index: number) {
    return <tbody>{createRowsBody(table.tbody![index].tr)}</tbody>
  }

  function renderCorrectionNotice() {
    if (table.tfoot!.correctionNotice) {
      return (
        <tr className='correction-notice'>
          <td colSpan='100%'>{table.tfoot!.correctionNotice}</td>
        </tr>
      )
    }
    return null
  }

  function addTFoot() {
    const { footnotes, correctionNotice } = table.tfoot!

    const noteRefs = table.noteRefs

    if ((noteRefs && noteRefs.length > 0) || correctionNotice) {
      return (
        <tfoot>
          {noteRefs!.map((note, index) => {
            const current = footnotes && footnotes.find((footnote) => footnote.noteid === note)
            if (current) {
              return (
                <tr key={index} className='footnote'>
                  <td colSpan='100%'>
                    <sup>{index + 1}</sup>
                    {current.content}
                  </td>
                </tr>
              )
            } else {
              return null
            }
          })}
          {renderCorrectionNotice()}
        </tfoot>
      )
    }
    return null
  }

  function createRowsHead(rows: TableCellUniform[]) {
    if (rows) {
      return rows.map((row, i) => {
        return <tr key={i}>{createHeaderCell(row)}</tr>
      })
    }
  }

  function createRowsBody(rows: TableCellUniform[]) {
    if (rows) {
      return rows.map((row, i) => {
        return (
          <tr key={i}>
            {createBodyTh(row)}
            {createBodyTd(row)}
          </tr>
        )
      })
    }
  }

  function createHeaderCell(row: TableCellUniform) {
    return Object.keys(row).map((keyName: 'th' | 'td') => {
      const value = row[keyName]
      if (keyName === 'th') {
        return createHeadTh(value)
      } else if (keyName === 'td') {
        return createHeadTd(value)
      }
    })
  }

  function createHeadTh(value: (string | number | PreliminaryData)[]) {
    return value.map((cellValue, i) => {
      if (typeof cellValue === 'object') {
        if (Array.isArray(cellValue)) {
          // TODO: Because some values is split into array by xmlParser i have to do this, find better fix
          return <th key={i}>{cellValue.join(' ')}</th>
        } else {
          return (
            <th
              key={i}
              className={cellValue.class}
              rowSpan={cellValue.rowspan}
              colSpan={cellValue.colspan}
              scope={cellValue.rowspan || cellValue.colspan ? 'colgroup' : 'col'}
            >
              {trimValue(cellValue.content)}
              {addNoteRefs(cellValue.noterefs)}
            </th>
          )
        }
      } else {
        return (
          <th key={i} scope='col'>
            {trimValue(cellValue)}
          </th>
        )
      }
    })
  }

  function createHeadTd(value: (string | number | PreliminaryData)[]) {
    return value.map((cellValue, i) => {
      if (typeof cellValue === 'object') {
        return (
          <td key={i} className={cellValue.class} rowSpan={cellValue.rowspan} colSpan={cellValue.colspan}>
            {trimValue(cellValue.content)}
            {addNoteRefs(cellValue.noterefs)}
          </td>
        )
      } else {
        return <td key={i}>{trimValue(cellValue)}</td>
      }
    })
  }

  function createBodyTh(row: TableCellUniform) {
    return Object.keys(row).map((key: 'th' | 'td') => {
      const value = row[key]
      if (key === 'th') {
        return value.map((cellValue, i) => {
          if (typeof cellValue === 'object') {
            return (
              <th
                key={i}
                className={cellValue.class}
                rowSpan={cellValue.rowspan}
                colSpan={cellValue.colspan}
                scope={cellValue.rowspan || cellValue.colspan ? 'rowgroup' : 'row'}
              >
                {trimValue(cellValue.content)}
                {addNoteRefs(cellValue.noterefs)}
              </th>
            )
          } else {
            return (
              <th key={i} scope='row'>
                {trimValue(cellValue)}
              </th>
            )
          }
        })
      }
    })
  }

  function createBodyTd(row: TableCellUniform) {
    return Object.keys(row).map((keyName: 'th' | 'td') => {
      const value = row[keyName]
      if (keyName === 'td') {
        return value.map((cellValue, i) => {
          if (typeof cellValue === 'object') {
            return (
              <td key={i} className={cellValue.class} rowSpan={cellValue.rowspan} colSpan={cellValue.colspan}>
                {formatNumber(cellValue.content)}
              </td>
            )
          } else {
            return <td key={i}>{formatNumber(cellValue)}</td>
          }
        })
      }
    })
  }

  function addNoteRefs(noteRefId: string) {
    if (noteRefId) {
      const noteRefs = table.noteRefs
      const noteIDs = noteRefId.split(' ')
      const notesToReturn = noteRefs!.reduce((acc, current, index) => {
        // Lag et array av indeksen til alle id-enene i footer
        return noteIDs.some((element) => element === current) ? acc.concat(index) : acc
      }, [])

      if (notesToReturn) {
        return <sup>{notesToReturn.map((noteRef) => `${noteRef + 1} `)}</sup>
      }
    } else return ''
  }

  function addStandardSymbols() {
    const { standardSymbol } = props

    if (standardSymbol && standardSymbol.href && standardSymbol.text) {
      return (
        <Link href={standardSymbol.href} standAlone>
          {standardSymbol.text}
        </Link>
      )
    }
  }

  function addPreviewButton() {
    if (showPreviewToggle && !props.pageTypeStatistic) {
      return (
        <Button primary onClick={toggleDraft}>
          {!fetchUnPublished ? 'Vis upubliserte tall' : 'Vis publiserte tall'}
        </Button>
      )
    }
    return
  }

  function toggleDraft() {
    setFetchUnPublished(!fetchUnPublished)
    setTable(!fetchUnPublished && props.draftExist ? props.tableDraft : props.table)
  }

  function addPreviewInfo() {
    if (props.showPreviewDraft) {
      if (fetchUnPublished && props.draftExist) {
        return <Alert variant='info'>Tallene i tabellen nedenfor er upublisert</Alert>
      } else if (fetchUnPublished && !props.draftExist) {
        return <Alert variant='warning'>Finnes ikke upubliserte tall for denne tabellen</Alert>
      }
    }
    return
  }

  function renderSources() {
    const { sources, sourceLabel, sourceListTables, sourceTableLabel, statBankWebUrl } = props

    if ((sourceListTables && sourceListTables.length > 0) || (sources && sources.length > 0)) {
      return (
        <div className='row mt-5 source'>
          <div className='w-100 col-12'>
            <span className='source-title'>
              <strong>{sourceLabel}</strong>
            </span>
          </div>
          {sourceListTables.map((tableId, index) => {
            return (
              <div key={index} className='col-lg-3 col-12'>
                <Link href={statBankWebUrl + '/table/' + tableId} standAlone>
                  {sourceTableLabel + ' ' + tableId}
                </Link>
              </div>
            )
          })}
          {sources.map((source, index) => {
            if (source.url && source.urlText) {
              return (
                <div key={index} className='col-lg-3 col-12'>
                  <Link href={source.url} standAlone>
                    {source.urlText}
                  </Link>
                </div>
              )
            }
          })}
        </div>
      )
    }
    return null
  }

  const { hiddenTitle } = props
  return (
    <section className='xp-part part-table'>
      {!isEmpty(table) ? (
        <React.Fragment>
          <div className='d-none searchabletext'>
            <span>{hiddenTitle}</span>
          </div>
          <div className='container border-0'>
            {addPreviewButton()}
            {addDownloadTableDropdown(false)}
            {addPreviewInfo()}
            {createScrollControlsDesktop()}
            {createScrollControlsMobile()}
            <div
              className='table-wrapper searchabletext'
              onScroll={() => updateTableControlsDesktop()}
              ref={tableWrapperRef}
            >
              {createTable()}
            </div>
            {addDownloadTableDropdown(true)}
            {addStandardSymbols()}
            {renderSources()}
          </div>
        </React.Fragment>
      ) : (
        <div>
          <p>Ingen tilknyttet Tabell</p>
        </div>
      )}
    </section>
  )
}

export default Table
