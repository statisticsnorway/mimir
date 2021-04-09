import React from 'react'
import PropTypes from 'prop-types'
import { Button, Form, Row } from 'react-bootstrap'

const months = ['jan', 'feb', 'mar', 'apr', 'mai', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'des']
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
          <Button variant="primary" type="submit">
                        Beregn prisendring
          </Button>
        </Row>
      </Form>
    </div>
  }

  addDropdownMonth() {
    return (
      <Form.Control as="select">
        <option>Gjennomsnitt</option>
        <option>Januar</option>
        <option>Februar</option>
        <option>Mars</option>
        <option>April</option>
        <option>Mai</option>
        <option>Juni</option>
        <option>Juli</option>
        <option>August</option>
        <option>September</option>
        <option>Oktober</option>
        <option>November</option>
        <option>Desember</option>
      </Form.Control>
    )
  }
}

KpiCalculator.propTypes = {
  kpiServiceUrl: PropTypes.string
}


export default (props) => <KpiCalculator {...props} />
