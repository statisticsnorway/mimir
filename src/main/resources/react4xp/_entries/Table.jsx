import React from 'react'
import PropTypes from 'prop-types'
import { Dropdown, Link } from '@statisticsnorway/ssb-component-library'

class Table extends React.Component {
  addHeader() {
    if (this.props.tableTitle) {
      return (
        <h3 className="mb-5">{this.props.tableTitle}</h3>
      )
    }
    return
  }

  createTable() {
    if (this.props.head) {
      return (
        <table>
          {this.createThead(this.props.head)}
          {this.createTbody(this.props.body)}
        </table>
      )
    }
  }

  createThead(thead) {
    if (thead) {
      return (
        <thead>
          {this.createRowsHead(thead)}
        </thead>
      )
    }
  }

  createTbody(tbody) {
    if (tbody) {
      return (
        <tbody>
          {this.createRowsBody(tbody)}
        </tbody>
      )
    }
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
            <th key={keyIndex} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>{value.content}</th>
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
              return (
                <td key={i}>{cellValue}</td>
              )
            })
          } else {
            return (
              <td key={keyIndex} className={value.class} rowSpan={value.rowspan} colSpan={value.colspan}>{value.content}</td>
            )
          }
        }
      }
    })
  }

  createCell(row) {
    return Object.keys(row).map(function(keyName, keyIndex) {
      const value = row[keyName]
      if (keyName === 'td') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <td key={keyIndex}>{value}</td>
          )
        } else {
          if (Array.isArray(value)) {
            return value.map((cellValue, i) => {
              return (
                <td key={i}>{cellValue}</td>
              )
            })
          } else {
            return (
              <td key={keyIndex} rowSpan={value.rowspan} colSpan={value.colspan}>{value.content}</td>
            )
          }
        }
      }
      if (keyName === 'th') {
        if (typeof value === 'string' | typeof value === 'number') {
          return (
            <th key={keyIndex}>{value}</th>
          )
        } else {
          if (Array.isArray(value)) {
            return value.map((cellValue, i) => {
              return (
                <th key={i}>{cellValue}</th>
              )
            })
          } else {
            return (
              <th key={keyIndex} rowSpan={value.rowspan} colSpan={value.colspan}>{value.content}</th>
            )
          }
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

  addDownloadAsDropdown() {
    return (
      <div className="d-lg-flex justify-content-end">
        <Dropdown
          selectedItem={this.props.downloadAsTitle}
          items={this.props.downloadAsOptions}
        />
      </div>
    )
  }

  render() {
    return <div className="container tabell">
      <h1 className="mb-5">{this.props.displayName}</h1>
      {this.addDownloadAsDropdown()}
      {this.addHeader()}
      {this.createTable()}
      {this.addStandardSymbols()}
    </div>
  }
}

Table.propTypes = {
  downloadAsTitle: PropTypes.object,
  downloadAsOptions: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      id: PropTypes.string
    })
  ),
  displayName: PropTypes.string,
  tableTitle: PropTypes.string,
  standardSymbol: PropTypes.shape({
    href: PropTypes.string,
    text: PropTypes.string
  }),
  head: PropTypes.arrayOf(
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
        class: PropTypes.string
      })
    })
  ),
  body: PropTypes.arrayOf(
    PropTypes.shape({
      th: PropTypes.number | PropTypes.string | PropTypes.shape({
        content: PropTypes.string,
        class: PropTypes.string
      }),
      td: PropTypes.array | PropTypes.number | PropTypes.string | PropTypes.shape({
        content: PropTypes.string,
        class: PropTypes.string
      })
    })
  )
}

export default (props) => <Table {...props}/>
