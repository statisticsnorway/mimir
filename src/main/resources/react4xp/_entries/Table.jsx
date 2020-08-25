import React from 'react'
import PropTypes from 'prop-types'

class Table extends React.Component {
  render() {
    const {
      tableTitle
    } = this.props
    return <div className="container">
      <h1>{tableTitle}</h1>
      <table className="statistics">
        <caption>Bilparken<sup>1</sup><span className="metadata">Publisert 31. mars 2020</span></caption>
        <colgroup></colgroup>
        <colgroup></colgroup>
        <colgroup></colgroup>
        <colgroup></colgroup>
        <thead>
          <tr className="head first">
            <th className="first" rowSpan="2"></th>
            <th scope="col" rowSpan="2">2019</th>
            <th scope="col">Endring i prosent</th>
            <th className="last" scope="col">Endring i prosent</th>
          </tr>
          <tr className="head last">
            <th className="first" scope="col">2018 - 2019</th>
            <th className="last" scope="col">2014 - 2019</th>
          </tr>
        </thead>
        <tfoot>
          <tr>
            <td colSpan="4" className="fotnote first"><sup>1</sup>Statistikken omfatter alle registrerte kjøretøy per 31.
            desember
            </td>
          </tr>
          <tr>
            <td colSpan="4" className="fotnote"><sup>2</sup>Omfatter også ambulanser, kombinerte biler og bobiler</td>
          </tr>
        </tfoot>
        <tbody>
          <tr className="first">
            <th className="med-fotnote first" scope="row">Personbiler<sup>2</sup></th>
            <td>2 816 038</td>
            <td>1,7</td>
            <td className="last">8,9</td>
          </tr>
          <tr className="odd">
            <th className="level1 first" scope="row">Elbiler</th>
            <td>260 692</td>
            <td>33,4</td>
            <td className="last">574,5</td>
          </tr>
          <tr>
            <th className="first" scope="row">Varebiler</th>
            <td>489 417</td>
            <td>2,6</td>
            <td className="last">10,7</td>
          </tr>
          <tr className="odd">
            <th className="first" scope="row">Lastebiler</th>
            <td>72 078</td>
            <td>-0,5</td>
            <td className="last">-8,4</td>
          </tr>
          <tr>
            <th className="first" scope="row">Busser</th>
            <td>15 867</td>
            <td>1,5</td>
            <td className="last">-7,3</td>
          </tr>
          <tr className="odd">
            <th className="first" scope="row">Traktorer</th>
            <td>291 841</td>
            <td>2,5</td>
            <td className="last">10,6</td>
          </tr>
          <tr>
            <th className="first" scope="row">Kranbiler ol.</th>
            <td>6 463</td>
            <td>-3,8</td>
            <td className="last">-17,2</td>
          </tr>
          <tr className="odd">
            <th className="first" scope="row">Moped</th>
            <td>159 273</td>
            <td>-2,5</td>
            <td className="last">-10,3</td>
          </tr>
          <tr>
            <th className="first" scope="row">Lett motorsykkel</th>
            <td>28 223</td>
            <td>5,5</td>
            <td className="last">27,6</td>
          </tr>
          <tr className="odd">
            <th className="first" scope="row">Tung motorsykkel</th>
            <td>170 249</td>
            <td>2,7</td>
            <td className="last">25,0</td>
          </tr>
          <tr>
            <th className="first" scope="row">Snøscootere</th>
            <td>91 931</td>
            <td>3,0</td>
            <td className="last">18,6</td>
          </tr>
          <tr className="odd last">
            <th className="first" scope="row">Tilhengere</th>
            <td>1 481 816</td>
            <td>2,6</td>
            <td className="last">16,4</td>
          </tr>
        </tbody>
      </table>
    </div>
  }
}

Table.propTypes = {
  tableTitle: PropTypes.string
}

export default (props) => <Table {...props}/>
