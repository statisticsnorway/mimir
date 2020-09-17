import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Link } from '@statisticsnorway/ssb-component-library'
import { isEmpty } from 'ramda'

import '../../assets/js/jquery-global.js'
import 'tableexport.jquery.plugin/libs/FileSaver/FileSaver.min.js'
import 'tableexport.jquery.plugin/tableExport.min.js'

class Table extends React.Component {
  downloadTableAsCSV() {
    const table = $('table').closest('.container')
    table.tableExport({
      type: 'csv',
      fileName: 'tabell',
      csvSeparator: ';'
    })
  }

  addDownloadTableDropdown() {
    const {
      downloadTableLabel,
      downloadTableTitle,
      downloadTableOptions
    } = this.props

    const downloadTable = (item) => {
      if (item.id === 'downloadTableAsCSV') {
        { this.downloadTableAsCSV() }
      }
    }

    return (
      <div className="download-table-container">
        <Dropdown
          header={downloadTableLabel}
          selectedItem={downloadTableTitle}
          items={downloadTableOptions}
          onSelect={downloadTable}
        />
      </div>
    )
  }

  createTable() {
    return (
      <table className={this.props.table.tableClass}>
        {this.addCaption()}
        {this.addThead()}
        {this.addTbody()}
        {this.addTFoot()}
      </table>
    )
  }

  addCaption() {
    if (this.props.table.caption) {
      if (typeof this.props.table.caption === 'object') {
        return (
          <caption noterefs={this.props.table.caption.noterefs}>
            {this.props.table.caption.content}
            {this.addNoteRefs(this.props.table.caption.noterefs)}
          </caption>
        )
      } else {
        return (
          <caption>
            {this.props.table.caption}
          </caption>
        )
      }
    }
  }

  addThead() {
    return (
      <thead>
        {this.createRowsHead(this.props.table.thead)}
      </thead>
    )
  }

  addTbody() {
    return (
      <tbody>
        {this.createRowsBody(this.props.table.tbody)}
      </tbody>
    )
  }

  renderCorrectionNotice() {
    if (this.props.table.tfoot.correctionNotice) {
      return (
        <tr className="correction-notice">
          <td colSpan="100%">
            {this.props.table.tfoot.correctionNotice}
          </td>
        </tr>
      )
    }
    return null
  }

  addTFoot() {
    const {
      footnotes, correctionNotice
    } = this.props.table.tfoot
    const noteRefsList = this.props.table.noteRefs
    if (footnotes.length > 0 && noteRefsList.length > 0 || correctionNotice) {
      return (
        <tfoot>
          {noteRefsList.map((noteRef, index) => {
            const footNote = footnotes.find((note) => note.noteid === noteRef)
            return (
              <tr key={index} className="footnote">
                <td colSpan="100%">
                  <sup>{index + 1}</sup>{footNote.content}
                </td>
              </tr>
            )
          })}
          {this.renderCorrectionNotice()}
        </tfoot>
      )
    }
    return null
  }

  createRowsHead(rows) {
    if (rows) {
      return rows.map((row, i) => {
        return (
          <tr key={i}>
            { this.createHeaderCell(row) }
          </tr>
        )
      })
    }
  }

  createRowsBody(rows) {
    if (rows) {
      return rows.map((row, i) => {
        return (
          <tr key={i}>
            { this.createBodyTh(row) }
            { this.createBodyTd(row) }
          </tr>
        )
      })
    }
  }

  createHeaderCell(row) {
    return Object.keys(row).map((keyName, keyIndex) => {
      const value = row[keyName]
      if (keyName === 'th') {
        return (
          this.createHeadTh(keyName, value, keyIndex)
        )
      } else if (keyName === 'td') {
        return (
          this.createHeadTd(keyName, value, keyIndex)
        )
      }
    })
  }

  createHeadTh(key, value, index) {
    if (typeof value === 'string' | typeof value === 'number') {
      return (
        <th key={index}>{value}</th>
      )
    } else {
      if (Array.isArray(value)) {
        return value.map((cellValue, i) => {
          if (typeof cellValue === 'object') {
            if (Array.isArray(cellValue)) {
              //TODO: Because some values is split into array by xmlParser i have to do this, find better fix
              return (
                <th key={i}>{cellValue.join(' ')}</th>
              )
            } else {
              return (
                <th key={i} className={cellValue.class} rowSpan={cellValue.rowspan} colSpan={cellValue.colspan}>
                  {cellValue.content}
                  {this.addNoteRefs(cellValue.noterefs)}
                </th>
              )
            }
          } else {
            return (
              <th key={i}>{cellValue}</th>
            )
          }
        })
      } else {
        return (
          <th key={key} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>
            {value.content}
            {this.addNoteRefs(value.noterefs)}
          </th>
        )
      }
    }
  }

  createHeadTd(key, value, index) {
    if (typeof value === 'string' | typeof value === 'number') {
      return (
        <td key={index}>{value}</td>
      )
    } else {
      return (
        <td key={key} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>
          {value.content}
          {this.addNoteRefs(value.noterefs)}
        </td>
      )
    }
  }

  createBodyTh(row) {
    return Object.keys(row).map((key, index) => {
      const value = row[key]
      if (key === 'th') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <th key={index}>{value}</th>
          )
        } else {
          return (
            <th key={index} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>
              {value.content}
              {this.addNoteRefs(value.noterefs)}
            </th>
          )
        }
      }
    })
  }

  createBodyTd(row) {
    const language = this.props.table.language
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (keyName === 'td') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <th key={keyIndex}>{value}</th>
          )
        } else {
          if (Array.isArray(value)) {
            return value.map((cellValue, i) => {
              if (typeof cellValue === 'object') {
                return (
                  <td className={cellValue.class} key={i}>{cellValue.content}</td>
                )
              } else {
                return (
                  <td key={i}>{cellValue.toLocaleString((language == 'en') ? 'en-GB' : 'no-NO')}</td>
                )
              }
            })
          } else {
            return (
              <td key={keyIndex} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>
                {value.content}
              </td>
            )
          }
        }
      }
    })
  }

  addNoteRefs(noteRefId) {
    if (noteRefId != undefined) {
      const noteRefsList = this.props.table.noteRefs
      const noteRefIndex = noteRefsList.indexOf(noteRefId)
      if (noteRefIndex > -1) {
        return (
          <sup>{noteRefIndex + 1}</sup>
        )
      }
    }
  }

  addStandardSymbols() {
    if (this.props.standardSymbol) {
      return (
        <Link href={this.props.standardSymbol.href} >{this.props.standardSymbol.text}</Link>
      )
    }
    return
  }

  renderSources() {
    const {
      sources,
      sourceLabel
    } = this.props

    if (sources && sources.length > 0) {
      return (
        <div className="row mt-5 source">
          <div className="w-100 col-12">
            <span><strong>{sourceLabel}</strong></span>
          </div>
          {sources.map((source, index) => {
            return (
              <div key={index} className="col-lg-3 col-12 mb-3">
                <Link href={source.url}>{source.urlText}</Link>
              </div>
            )
          })}
        </div>
      )
    }
    return null
  }

  render() {
    if (!isEmpty(this.props.table)) {
      return <div className="container">
        {this.addDownloadTableDropdown()}
        {this.createTable()}
        {this.addStandardSymbols()}
        {this.renderSources()}
      </div>
    } else {
      return <div>
        <p>Ingen tilknyttet Tabell</p>
      </div>
    }
  }
}

Table.propTypes = {
  downloadTableLabel: PropTypes.string,
  downloadTableTitle: PropTypes.object,
  downloadTableOptions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      id: PropTypes.string
    })
  ),
  standardSymbol: PropTypes.shape({
    href: PropTypes.string,
    text: PropTypes.string
  }),
  sourceLabel: PropTypes.string,
  sources: PropTypes.arrayOf(PropTypes.shape({
    urlText: PropTypes.string,
    url: PropTypes.string
  })),
  iconUrl: PropTypes.string,
  table: PropTypes.shape({
    caption: PropTypes.string | PropTypes.shape({
      content: PropTypes.string,
      noterefs: PropTypes.string
    }),
    tableClass: PropTypes.string,
    thead: PropTypes.arrayOf(
      PropTypes.shape({
        td: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          rowspan: PropTypes.number,
          colspan: PropTypes.number,
          content: PropTypes.string,
          class: PropTypes.string
        }),
        th: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          rowspan: PropTypes.number,
          colspan: PropTypes.number,
          content: PropTypes.string,
          class: PropTypes.string,
          noterefs: PropTypes.string
        })
      })
    ),
    tbody: PropTypes.arrayOf(
      PropTypes.shape({
        th: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          content: PropTypes.string,
          class: PropTypes.string,
          noterefs: PropTypes.string
        }),
        td: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
          content: PropTypes.string,
          class: PropTypes.string
        })
      })
    ),
    tfoot: PropTypes.shape({
      footnotes: PropTypes.arrayOf(
        PropTypes.shape({
          noteid: PropTypes.string,
          content: PropTypes.string
        })
      ),
      correctionNotice: PropTypes.string
    }),
    language: PropTypes.string,
    noteRefs: PropTypes.arrayOf(PropTypes.string)
  })
}

export default (props) => <Table {...props}/>
