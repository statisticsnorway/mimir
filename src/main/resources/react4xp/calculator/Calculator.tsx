import React, { type RefObject, type ReactNode } from 'react'
import { FormError, Divider, Title, Button } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col, Form } from 'react-bootstrap'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'
import { type CommonCalculatorProps } from '/lib/types/calculator'

// TODO: Look over all the props
interface CalculatorProps {
  loading: boolean
  errorMessage: string
  phrases: CommonCalculatorProps['phrases']
  language: CommonCalculatorProps['language']
  renderCalculatorForm?: CallableFunction
  calculatorFormProps?: CalculatorFormProps
  renderCalculatorResult?: CallableFunction
  calculatorResultProps?: CalculatorResultProps
}

interface CalculatorFormProps {
  calculatorTitle: string
  nextPublishText: string
  renderOptions: () => ReactNode
  renderPeriodDropdown: () => ReactNode
  renderYearInput: () => ReactNode
  onSubmit: () => void
  onSubmitBtnElement: RefObject<HTMLButtonElement>
}

interface CalculatorResultProps {
  scrollAnchor: RefObject<HTMLDivElement>
  calculatorResultForScreenreader: string
  endValue: string
  change: string
  closeResult: () => void
  priceChangeLabel: string
  changeValue: string
  startValueResult: string
  startPeriod: string
  endPeriod: string
  startIndex: string
  endIndex: string
}

function Calculator(props: CalculatorProps) {
  const {
    loading,
    errorMessage,
    phrases,
    language,
    renderCalculatorForm,
    calculatorFormProps,
    renderCalculatorResult,
    calculatorResultProps,
  } = props

  const formProps = calculatorFormProps ?? {}
  const resultProps = calculatorResultProps ?? {}

  const {
    calculatorTitle,
    nextPublishText,
    renderOptions,
    renderPeriodDropdown,
    renderYearInput,
    onSubmit,
    onSubmitBtnElement,
  } = formProps as CalculatorFormProps

  const {
    scrollAnchor,
    calculatorResultForScreenreader,
    endValue,
    change,
    closeResult,
    priceChangeLabel,
    changeValue,
    startValueResult,
    startPeriod,
    endPeriod,
    startIndex,
    endIndex,
  } = resultProps as CalculatorResultProps

  function renderForm() {
    return (
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
        <Form onSubmit={() => onSubmit()}>
          <Container>
            {renderOptions()}
            <Row>
              <Col className='calculate-from col-12 col-lg-6'>
                <Title size={3}>{phrases.calculatePriceChangeFrom}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>{renderYearInput()}</Col>
                    <Col className='select-month col-12 col-sm-7'>{renderPeriodDropdown()}</Col>
                  </Row>
                </Container>
              </Col>
              <Col className='calculate-to col-12 col-lg-6'>
                <Title size={3}>{phrases.calculatePriceChangeTo}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>{renderYearInput()}</Col>
                    <Col className='select-month col-12 col-sm-7'>{renderPeriodDropdown()}</Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
          <Row className='submit'>
            <Col>
              <Button ref={onSubmitBtnElement} className='submit-button' primary type='submit' disabled={loading}>
                {phrases.seePriceChange}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }

  function renderNumber(value: string | number, type?: string) {
    if (endValue && change) {
      const decimalSeparator = language === 'en' ? '.' : ','
      if (type === 'valute' || type === 'change') {
        const valute = language === 'en' ? 'NOK' : 'kr'
        const decimalScale = type === 'valute' ? 2 : 1
        return (
          <React.Fragment>
            <NumericFormat
              value={Number(value)}
              displayType='text'
              thousandSeparator=' '
              decimalSeparator={decimalSeparator}
              decimalScale={decimalScale}
              fixedDecimalScale
            />
            {type === 'valute' ? valute : '%'}
          </React.Fragment>
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
    return null
  }

  function calculatorResult() {
    return (
      <Container className='calculator-result' ref={scrollAnchor} tabIndex={0}>
        <div aria-atomic='true'>
          <span className='sr-only'>{calculatorResultForScreenreader}</span>
        </div>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='amount-equal col-12 col-md-4'>
            <h3>{phrases.amountEqualled}</h3>
          </Col>
          <Col className='end-value col-12 col-md-8'>
            <span className='float-start float-md-end'>{renderNumber(endValue!, 'valute')}</span>
          </Col>
          <Col className='col-12'>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='col-12 col-lg-4'>
            <span>{priceChangeLabel}</span>
            <span className='float-end'>{renderNumber(changeValue!, 'change')}</span>
            <Divider dark />
          </Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {phrases.amount} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startValueResult!, 'change')}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {phrases.amount} {endPeriod}
            </span>
            <span className='float-end'>{renderNumber(endValue!, 'change')}</span>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='col-12 col-lg-4'></Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {phrases.index} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startIndex!)}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {phrases.index} {endPeriod}
            </span>
            <span className='float-end'>{renderNumber(endIndex!)}</span>
            <Divider dark />
          </Col>
        </Row>
        <Row aria-live='off'>
          <Col className='md-6'>
            <button className='ssb-btn close-button' onClick={() => closeResult()} autoFocus>
              {' '}
              <X size='18' />
              {phrases.close}
            </button>
          </Col>
        </Row>
      </Container>
    )
  }

  function renderResult() {
    if (loading) {
      return (
        <Container>
          <span className='spinner-border spinner-border' />
        </Container>
      )
    }

    if (errorMessage) {
      return (
        <Container className='calculator-error'>
          <Row>
            <Col>
              <FormError
                errorMessages={[errorMessage || phrases.calculatorUknownError]}
                title={phrases.calculatorErrorCalculationFailed}
              />
            </Col>
          </Row>
        </Container>
      )
    }

    if (endValue && change) {
      return renderCalculatorResult?.() ?? calculatorResult()
    }

    return null
  }

  return (
    <Container className='content'>
      {renderCalculatorForm?.() ?? renderForm()}
      <div aria-live='polite'>{renderResult()}</div>
    </Container>
  )
}

export default (props: CalculatorProps) => <Calculator {...props} />
