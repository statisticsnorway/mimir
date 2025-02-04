import React, { ReactNode } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, FormError } from '@statisticsnorway/ssb-component-library'

interface CalculatorLayoutProps {
  calculatorTitle: string
  nextPublishText: string
  loading?: boolean
  errorMessage?: string | null
  calculatorUknownError?: string
  calculatorErrorCalculationFailed?: string
  renderForm: () => ReactNode
  renderResult: () => ReactNode
}

function CalculatorLayout({
  calculatorTitle,
  nextPublishText,
  loading,
  errorMessage,
  calculatorUknownError,
  calculatorErrorCalculationFailed,
  renderForm,
  renderResult,
}: CalculatorLayoutProps) {
  function renderResultWrapper() {
    if (loading) {
      return (
        <Container>
          <span className='spinner-border spinner-border' />
        </Container>
      )
    }
    if (errorMessage !== null && errorMessage !== undefined) {
      return (
        <Container className='calculator-error'>
          <Row>
            <Col>
              <FormError
                errorMessages={[errorMessage || calculatorUknownError]}
                title={calculatorErrorCalculationFailed}
              />
            </Col>
          </Row>
        </Container>
      )
    }
    return renderResult()
  }

  return (
    <Container className='content'>
      <div className='calculator-form'>
        <Row>
          <Col>
            <Title size={2}>{calculatorTitle}</Title>
          </Col>
        </Row>
        <Row>
          <Col>
            <p className='publish-text'>{nextPublishText}</p>
          </Col>
        </Row>
        {renderForm()}
      </div>
      <div aria-live='polite'>{renderResultWrapper()}</div>
    </Container>
  )
}

export default (props: CalculatorLayoutProps) => <CalculatorLayout {...props} />
