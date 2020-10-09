import React from 'react'
import { useSelector } from 'react-redux'
import { Col, Row, Table } from 'react-bootstrap'
import { selectStatistics, selectLoading } from './selectors'

export function Statistics() {
  const statistics = useSelector(selectStatistics)
  const loading = useSelector(selectLoading)

  function renderStatistics() {
    if (loading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    return (
      <Table bordered striped>
        <thead>
          <tr>
            <th className="roboto-bold">
              <span>Statistikk</span>
            </th>
            <th className="roboto-bold">
              <span>Publisering</span>
            </th>
          </tr>
        </thead>
        {getStatistics()}
      </Table>
    )
  }

  function getStatistics() {
    if (statistics != undefined) {
      return (
        <tbody>
          {statistics.map((statistic) => {
            return (
              <tr key={statistic.id}>
                <td className='statistic'>
                  <span>{statistic.name}</span>
                </td>
                <td>
                  <span>{statistic.nextRelease}</span>
                </td>
              </tr>
            )
          })}
        </tbody>
      )
    }
    return (
      <tbody/>
    )
  }

  return (
    <section className="xp-part part-dashboard container mb-5">
      <Row>
        <Col>
          <div className="p-4 tables-wrapper">
            <h2 className="mb-3">Kommende publiseringer</h2>
            {renderStatistics()}
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <Statistics {...props} />
