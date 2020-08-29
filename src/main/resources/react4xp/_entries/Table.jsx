import React from 'react'
import PropTypes from 'prop-types'

class Table extends React.Component {
  addExampleTable() {
    if (this.props.tableTitle) {
      return (
        <table className="statistics overflows">
          <caption>Vrakpantordningen for person- og varebiler</caption>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <colgroup></colgroup>
          <thead>
            <tr className="head first last">
              <th className="first"></th>
              <th scope="col">Biler vraket i alt</th>
              <th scope="col">Personbiler</th>
              <th scope="col">Varebiler</th>
              <th scope="col">Andel av alle personbiler som ble vraket</th>
              <th scope="col">Andel av alle varebiler som ble vraket</th>
              <th scope="col">Personbiler (snittalder ved vraking)</th>
              <th className="last" scope="col">Varebiler (snittalder ved vraking)</th>
            </tr>
          </thead>
          <tfoot></tfoot>
          <tbody>
            <tr className="first">
              <th className="first" scope="row">2001</th>
              <td>96 720</td>
              <td>90 734</td>
              <td>5 986</td>
              <td>4,8</td>
              <td>2,4</td>
              <td>17,8</td>
              <td className="last">15,4</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2002</th>
              <td>106 498</td>
              <td>99 522</td>
              <td>6 976</td>
              <td>5,2</td>
              <td>2,7</td>
              <td>18,0</td>
              <td className="last">15,7</td>
            </tr>
            <tr>
              <th className="first" scope="row">2003</th>
              <td>102 341</td>
              <td>95 224</td>
              <td>7 117</td>
              <td>4,9</td>
              <td>2,7</td>
              <td>18,4</td>
              <td className="last">16,0</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2004</th>
              <td>108 880</td>
              <td>101 915</td>
              <td>6 965</td>
              <td>5,2</td>
              <td>2,5</td>
              <td>18,6</td>
              <td className="last">16,0</td>
            </tr>
            <tr>
              <th className="first" scope="row">2005</th>
              <td>102 044</td>
              <td>95 589</td>
              <td>6 455</td>
              <td>4,7</td>
              <td>2,1</td>
              <td>18,9</td>
              <td className="last">16,0</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2006</th>
              <td>105 324</td>
              <td>98 359</td>
              <td>6 965</td>
              <td>4,7</td>
              <td>2,1</td>
              <td>19,0</td>
              <td className="last">15,5</td>
            </tr>
            <tr>
              <th className="first" scope="row">2007</th>
              <td>99 885</td>
              <td>93 193</td>
              <td>6 692</td>
              <td>4,3</td>
              <td>1,8</td>
              <td>18,9</td>
              <td className="last">15,3</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2008</th>
              <td>107 153</td>
              <td>98 552</td>
              <td>8 601</td>
              <td>4,5</td>
              <td>2,3</td>
              <td>18,7</td>
              <td className="last">15,5</td>
            </tr>
            <tr>
              <th className="first" scope="row">2009</th>
              <td>94 497</td>
              <td>87 137</td>
              <td>7 360</td>
              <td>3,9</td>
              <td>1,9</td>
              <td>18,5</td>
              <td className="last">14,9</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2010</th>
              <td>98 662</td>
              <td>90 758</td>
              <td>7 904</td>
              <td>3,9</td>
              <td>2,0</td>
              <td>18,4</td>
              <td className="last">14,9</td>
            </tr>
            <tr>
              <th className="first" scope="row">2011</th>
              <td>117 520</td>
              <td>107 787</td>
              <td>9 733</td>
              <td>4,6</td>
              <td>2,4</td>
              <td>19,2</td>
              <td className="last">16,2</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2012</th>
              <td>117 578</td>
              <td>107 373</td>
              <td>10 205</td>
              <td>4,4</td>
              <td>2,4</td>
              <td>18,1</td>
              <td className="last">15,0</td>
            </tr>
            <tr>
              <th className="first" scope="row">2013</th>
              <td>150 905</td>
              <td>137 239</td>
              <td>13 666</td>
              <td>5,5</td>
              <td>3,1</td>
              <td>18,4</td>
              <td className="last">15,4</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2014</th>
              <td>144 385</td>
              <td>130 966</td>
              <td>13 419</td>
              <td>5,2</td>
              <td>3,0</td>
              <td>18,5</td>
              <td className="last">15,6</td>
            </tr>
            <tr>
              <th className="first" scope="row">2015</th>
              <td>135 801</td>
              <td>122 566</td>
              <td>13 235</td>
              <td>4,7</td>
              <td>2,9</td>
              <td>18,4</td>
              <td className="last">15,5</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2016</th>
              <td>134 881</td>
              <td>121 484</td>
              <td>13 397</td>
              <td>4,6</td>
              <td>2,9</td>
              <td>18,3</td>
              <td className="last">15,3</td>
            </tr>
            <tr>
              <th className="first" scope="row">2017</th>
              <td>136 203</td>
              <td>121 385</td>
              <td>14 818</td>
              <td>4,5</td>
              <td>3,1</td>
              <td>18,2</td>
              <td className="last">15,2</td>
            </tr>
            <tr className="odd">
              <th className="first" scope="row">2018</th>
              <td>137 134</td>
              <td>121 838</td>
              <td>15 296</td>
              <td>4,5</td>
              <td>3,2</td>
              <td>18,1</td>
              <td className="last">15,1</td>
            </tr>
            <tr className="last">
              <th className="first" scope="row">2019</th>
              <td>138 855</td>
              <td>122 386</td>
              <td>16 469</td>
              <td>4,4</td>
              <td>3,4</td>
              <td>18,1</td>
              <td className="last">15,3</td>
            </tr>
          </tbody>
        </table>
      )
    }
    return
  }

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
          <tr key={i} teste={i}>
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
            { this.createCell(row) }
          </tr>
        )
      })
    }
  }

  createCell(row) {
     return Object.keys(row).map(function(keyName, keyIndex) {
       const value = row[keyName]
      if (keyName === 'td') {
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
      if (keyName === 'th') {
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

    })

  }

  render() {
    return <div className="container tabell">
      <h1 className="mb-5">{this.props.displayName}</h1>
      {this.addHeader()}
      {this.createTable()}
      {/* {this.addExampleTable()}*/}
    </div>
  }
}

Table.propTypes = {
  displayName: PropTypes.string,
  tableTitle: PropTypes.string,
  head: PropTypes.arrayOf(
    PropTypes.shape({
      td: PropTypes.array | PropTypes.string | PropTypes.shape({
        rowspan: PropTypes.number,
        colspan: PropTypes.number,
        content: PropTypes.string
      }),
      th: PropTypes.number | PropTypes.array | PropTypes.shape({
        rowspan: PropTypes.number,
        colspan: PropTypes.number,
        content: PropTypes.string
      })
    })
  ),
  body: PropTypes.arrayOf(
    PropTypes.shape({
      td: PropTypes.array | PropTypes.string | PropTypes.shape({
        rowspan: PropTypes.number,
        colspan: PropTypes.number,
        content: PropTypes.string
      }),
      th: PropTypes.number | PropTypes.array | PropTypes.shape({
        rowspan: PropTypes.number,
        colspan: PropTypes.number,
        content: PropTypes.string
      })
    })
  )
}

export default (props) => <Table {...props}/>
