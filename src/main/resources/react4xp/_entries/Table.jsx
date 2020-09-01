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
      </table>
    )
  }

  addCaption() {
    if (this.props.table.caption) {
      return (
        <caption>
          {this.props.table.caption}
        </caption>
      )
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
              return (
                <td key={i}>{cellValue}</td>
              )
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

  render() {
    if (!isEmpty(this.props.table)) {
      return <div className="container tabell">
        {this.createTable()}
        {this.addStandardSymbols()}
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
  table: PropTypes.shape({
    caption: PropTypes.string,
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
    )
  })
}

export default (props) => <Table {...props}/>
