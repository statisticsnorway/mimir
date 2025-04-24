import React, { isValidElement, ReactNode } from 'react'
import { Container, Row, Col } from 'react-bootstrap'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'
import { Title, FormError, Divider } from '@statisticsnorway/ssb-component-library'

interface ResultRowProps {
  label: string
  value: string | number
  type?: string
}

interface CalculatorResultProps {
  scrollAnchor?: React.RefObject<HTMLDivElement>
  screenReaderResultText?: string
  resultHeader?: ResultRowProps
  resultRows?: ResultRowProps[][]
  closeButtonText: string
  onClose: () => void
}

interface CalculatorLayoutProps {
  calculatorTitle: string
  nextPublishText: string
  language: string
  loading?: boolean
  errorMessage?: string | null
  calculatorUknownError?: string
  calculatorErrorCalculationFailed?: string
  renderForm: () => ReactNode
  renderResult: () => CalculatorResultProps | ReactNode | undefined
}

function CalculatorLayout({
  calculatorTitle,
  nextPublishText,
  language,
  loading,
  errorMessage,
  calculatorUknownError,
  calculatorErrorCalculationFailed,
  renderForm,
  renderResult,
}: CalculatorLayoutProps) {
  function renderNumber(value: string | number, type?: string) {
    const decimalSeparator = language === 'en' ? '.' : ','
    if (type === 'valute' || type === 'change') {
      const valute = language === 'en' ? ' NOK' : ' kr'
      const decimalScale = type === 'valute' ? 2 : 1
      return (
        <>
          <NumericFormat
            value={Number(value)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={decimalScale}
            fixedDecimalScale
          />
          {type === 'valute' ? valute : '%'}
        </>
      )
    } else {
      return (
        <NumericFormat
          value={Number(value)}
          displayType='text'
          thousandSeparator=' '
          decimalSeparator={decimalSeparator}
          decimalScale={1}
          fixedDecimalScale
        />
      )
    }
  }

  function renderCalculatorResult() {
    const resultProps = renderResult() as CalculatorResultProps
    const { scrollAnchor, screenReaderResultText, resultHeader, resultRows, closeButtonText, onClose } = resultProps

    return (
      <Container className='calculator-result' ref={scrollAnchor} tabIndex={0}>
        {screenReaderResultText && (
          <div aria-atomic='true'>
            <span className='sr-only'>{screenReaderResultText}</span>
          </div>
        )}

        {resultHeader && (
          <Row className='mb-5' aria-hidden='true'>
            <Col className='amount-equal col-12 col-md-4'>
              <h3>{resultHeader.label}</h3>
            </Col>
            <Col className='end-value col-12 col-md-8'>
              <span className='float-start float-md-end'>{renderNumber(resultHeader.value, resultHeader.type)}</span>
            </Col>
            <Col className='col-12'>
              <Divider dark />
            </Col>
          </Row>
        )}

        {resultRows?.map((rowGroup, groupIndex) => (
          <Row
            key={`${rowGroup[groupIndex].label}-${groupIndex}`}
            className={`d-flex justify-content-end${groupIndex === resultRows.length - 1 ? '' : ' mb-5'}`}
            aria-hidden='true'
          >
            {rowGroup.map(({ label, value, type }) => (
              <Col key={label} className='col-12 col-lg-4'>
                <span>{label}</span>
                <span className='float-end'>{renderNumber(value, type)}</span>
                <Divider dark />
              </Col>
            ))}
          </Row>
        ))}

        <Row aria-live='off'>
          <Col className='md-6'>
            <button className='ssb-btn close-button' onClick={onClose} autoFocus>
              <X size='18' />
              {closeButtonText}
            </button>
          </Col>
        </Row>
      </Container>
    )
  }

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

    const result = renderResult()
    if (!result) return null

    // Some calculators don't use the same result layout, so renderResult should support ReactNode types as well
    if (isValidElement(result)) {
      return result
    }
    return renderCalculatorResult()
  }

  return (
    <Container className='calculator-content'>
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
