import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Row } from 'react-bootstrap'

const months = [
  {
    code: 90,
    name: 'Gjennomsnitt'
  },
  {
    code: 1,
    name: 'Januar'
  },
  {
    code: 2,
    name: 'Februar'
  },
  {
    code: 3,
    name: 'Mars'
  },
  {
    code: 4,
    name: 'April'
  },
  {
    code: 5,
    name: 'Mai'
  },
  {
    code: 6,
    name: 'Juni'
  },,
  {
    code: 7,
    name: 'Juli'
  },
  {
    code: 8,
    name: 'August'
  },
  {
    code: 9,
    name: 'September'
  },
  {
    code: 10,
    name: 'Oktober'
  },
  {
    code: 11,
    name: 'November'
  },
  {
    code: 12,
    name: 'Desember'
  }
]

class KpiCalculator extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    return <div className="container">
      <Form>
        <Row>
          <Form.Group controlId="startValue">
            <Form.Label>Skriv inn beløp</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Row>

        <p>Beregn prisendring fra</p>
        <Row>
          <Form.Group controlId="startMonth">
            <Form.Label>Velg måned</Form.Label>
            {this.addDropdownMonth()}
          </Form.Group>
          <Form.Group controlId="startYear">
            <Form.Label>Skriv inn år(åååå)</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Row>

        <p>Beregn prisendring til</p>
        <Row>
          <Form.Group controlId="endMonth">
            <Form.Label>Velg måned</Form.Label>
            {this.addDropdownMonth()}
          </Form.Group>
          <Form.Group controlId="endYear">
            <Form.Label>Skriv inn år(åååå)</Form.Label>
            <Form.Control type="text" />
          </Form.Group>
        </Row>
        <Row>
          <Button variant="primary" type="submit">Beregn prisendring</Button>
        </Row>
      </Form>
    </div>
  }

  addDropdownMonth() {
    return (
      <Form.Control as="select">
        {months.map((month, index) => {
          return (
            <option key={month.code}>{month.name}</option>
          )
        })}
      </Form.Control>
    )
  }
}

KpiCalculator.propTypes = {
  kpiServiceUrl: PropTypes.string
}


export default (props) => <KpiCalculator {...props} />
