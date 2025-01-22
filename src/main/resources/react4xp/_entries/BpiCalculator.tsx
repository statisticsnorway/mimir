import React from 'react'
import { Title, Divider, Button } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col, Form } from 'react-bootstrap'

import { BpiCalculatorProps } from '/lib/types/partTypes/bpiCalculator'

function BpiCalculator(props: BpiCalculatorProps) {
  const { phrases, nextPublishText } = props

  function renderForm() {
    return (
      <div className='calculator-form'>
        <Form>
          <>Fields</>
          <Divider />
          <>Fields2</>
        </Form>
      </div>
    )
  }

  return (
    <Container className='content'>
      <Row>
        <Col className='col-12 col-md-6'>
          <Title size={2}>{phrases.calculatePriceChange}</Title> // TODO: This is different for bpiCalculator
        </Col>
      </Row>
      <Row>
        <Col className='col-12 col-md-8'>
          <p className='publish-text'>{nextPublishText}</p>
        </Col>
      </Row>
      {renderForm()}
      <Button></Button>
    </Container>
  )
}

export default (props: BpiCalculatorProps) => <BpiCalculator {...props} />
