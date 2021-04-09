import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown } from '@statisticsnorway/ssb-component-library'

function KpiCalculator() {
  const [validated] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
  }


  function addDropdownMonth() {
    return (
      <Dropdown
        header="Velg måned"
        selectedItem={{
          title: 'Gjennomsnitt',
          id: '90'
        }}
        items={months}
      />
    )
  }

  return (<Container>
    <h2>Beregn prisendring</h2>
    <p>Siste tilgjengelige tall er for januar 2021. Tall for februar kommer ca 10. mars.</p>
    <Form onSubmit={onSubmit} validated={validated}>
      <Container>
        <Row>
          <Col>
            <h3>Skriv inn beløp</h3>
            <Input handleChange={() => undefined}/>
          </Col>
        </Row>
        <Row>
          <Col>
            <h3>Beregn prisendring fra</h3>
            <Container>
              <Row>
                <Col className="col-8">
                  {addDropdownMonth()}
                </Col>
                <Col className="col-4">
                  <Input label={`Skriv inn år(åååå)`} handleChange={() => undefined} />
                </Col>
              </Row>
            </Container>
          </Col>
          <Col>
            <h3>Beregn prisendring til</h3>
            <Container>
              <Row>
                <Col className="col-8">
                  {addDropdownMonth()}
                </Col>
                <Col className="col-4">
                  <Input label={`Skriv inn år(åååå)`} handleChange={() => undefined} />
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
        <Row className="my-4">
          <Col>
            <Button primary type="submit">Beregn prisendring</Button>
          </Col>
        </Row>
      </Container>
    </Form>
  </Container>)
}

KpiCalculator.propTypes = {
  kpiServiceUrl: PropTypes.string
}


const months = [
  {
    id: '90',
    title: 'Gjennomsnitt'
  },
  {
    id: '01',
    title: 'Januar'
  },
  {
    id: '02',
    title: 'Februar'
  },
  {
    id: '03',
    title: 'Mars'
  },
  {
    id: '04',
    title: 'April'
  },
  {
    id: '05',
    title: 'Mai'
  },
  {
    id: '06',
    title: 'Juni'
  },,
  {
    id: '07',
    title: 'Juli'
  },
  {
    id: '08',
    title: 'August'
  },
  {
    id: '09',
    title: 'September'
  },
  {
    id: '10',
    title: 'Oktober'
  },
  {
    id: '11',
    title: 'November'
  },
  {
    id: '12',
    title: 'Desember'
  }
]

export default (props) => <KpiCalculator {...props} />
