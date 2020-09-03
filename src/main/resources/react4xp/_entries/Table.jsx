import React from 'react'
import PropTypes from 'prop-types'
import { Link } from '@statisticsnorway/ssb-component-library'
import { isEmpty } from 'ramda'

class Table extends React.Component {
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

    if (footnotes.length > 0 || correctionNotice) {
      return (
        <tfoot>
          {footnotes.map((footnote, index) => {
            return (
              <tr key={index} className="footnote">
                <td colSpan="100%">
                  <sup>{index + 1}</sup>{footnote}
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
            { this.createCell(row) }
          </tr>
        )
      })
    }
  }

  createRowsBody(rows) {
    if (rows) {
      return rows.map((row, i) => {
        return (
        // TODO: When parsing Tbml has correct order use createCell
          <tr key={i}>
            { this.createBodyTh(row) }
            { this.createBodyTd(row) }
          </tr>
        )
      })
    }
  }

  createBodyTh(row) {
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (keyName === 'th') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <th key={keyIndex}>{value}</th>
          )
        } else {
          return (
            <th key={keyIndex} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan} >
              {value.content}
            </th>
          )
        }
      }
    })
  }

  createBodyTd(row) {
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
                  <td key={i}>{cellValue}</td>
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

  createCell(row) {
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (typeof value === 'string' | typeof value === 'number') {
        return (
          React.createElement(keyName, {
            key: keyIndex
          }, value)
        )
      } else {
        if (Array.isArray(value)) {
          return value.map((cellValue, i) => {
            if (typeof cellValue === 'object') {
              return (
                React.createElement(keyName, {
                  key: i,
                  rowSpan: cellValue.rowspan,
                  colSpan: cellValue.colspan,
                  noterefs: cellValue.noterefs
                }, cellValue.content)
              )
            } else {
              return (
                React.createElement(keyName, {
                  key: i
                }, cellValue)
              )
            }
          })
        } else {
          return (
            React.createElement(keyName, {
              key: keyIndex,
              rowSpan: value.rowspan,
              colSpan: value.colspan,
              noterefs: value.noterefs
            }, value.content)
          )
        }
      }
    })
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
        <div className="row mt-3">
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
      return <div className="container tabell">
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
  standardSymbol: PropTypes.shape({
    href: PropTypes.string,
    text: PropTypes.string
  }),
  sourceLabel: PropTypes.string,
  sources: PropTypes.arrayOf(PropTypes.shape({
    urlText: PropTypes.string,
    url: PropTypes.string
  })),
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
      footnotes: PropTypes.arrayOf(PropTypes.string),
      correctionNotice: PropTypes.string
    })
  })
}

export default (props) => <Table {...props}/>
