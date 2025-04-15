import React, { useState, useRef } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, FormError, Link, Title } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'
import { sanitize } from '/lib/ssb/utils/htmlUtils'
import { KpiCalculatorProps } from '/lib/types/partTypes/kpiCalculator'

function KpiCalculator(props: KpiCalculatorProps) {
  const validMaxYear = props.lastUpdated.year
  const defaultMonthValue = {
    title: props.frontPage ? props.phrases.calculatorMonthAverageFrontpage : props.phrases.calculatorMonthAverage,
    id: '90',
  }
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateAmountNumber,
    value: '',
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: defaultMonthValue,
  })
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: `${props.phrases.kpiValidateYear} ${validMaxYear}`,
    value: '',
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: defaultMonthValue,
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: `${props.phrases.kpiValidateYear} ${validMaxYear}`,
    value: '',
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState<null | number>(null)
  const [change, setChange] = useState<null | string>(null)
  const [startPeriod, setStartPeriod] = useState<null | string>(null)
  const [endPeriod, setEndPeriod] = useState<null | string>(null)
  const [startValueResult, setStartValueResult] = useState<null | string>(null)
  const language = props.language ? props.language : 'nb'

  const validMaxMonth = props.lastUpdated.month
  const validMinYear = 1865
  const yearRegexp = /^[1-9]\d{3}$/g

  const scrollAnchor = useRef<null | HTMLDivElement>(null)
  function scrollToResult() {
    if (!scrollAnchor.current) return

    scrollAnchor.current.focus({
      preventScroll: true,
    })
    scrollAnchor.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest',
    })
  }

  function closeResult() {
    setEndValue(null)
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return
    setChange(null)
    setEndValue(null)
    if (!isFormValid()) {
      onBlur('start-value')
      onBlur('start-year')
      onBlur('end-year')
      return
    }
    setErrorMessage(null)
    setLoading(true)
    axios
      .get(props.kpiServiceUrl, {
        params: {
          startValue: startValue.value,
          startYear: startYear.value,
          startMonth: startMonth.value.id,
          endYear: endYear.value,
          endMonth: endMonth.value.id,
          language: language,
        },
      })
      .then((res) => {
        const changeVal = (res.data.change * 100).toFixed(1)
        const endVal = res.data.endValue.toFixed(2)
        const startPeriod = getPeriod(startYear.value, startMonth.value.id)
        const endPeriod = getPeriod(endYear.value, endMonth.value.id)
        setChange(changeVal)
        setEndValue(endVal)
        setStartPeriod(startPeriod)
        setEndPeriod(endPeriod)
        setStartValueResult(startValue.value)
      })
      .catch((err) => {
        if (err && err.response && err.response.data && err.response.data.error) {
          setErrorMessage(err.response.data.error)
        } else {
          setErrorMessage(err.toString())
        }
      })
      .finally(() => {
        setLoading(false)
        scrollToResult()
      })
  }

  function isFormValid() {
    return isStartValueValid() && isStartYearValid() && isStartMonthValid() && isEndYearValid() && isEndMonthValid()
  }

  function isStartValueValid(value?: string) {
    const startVal = value || startValue.value
    const testStartValue = startVal.match(/^-?\d+(?:[.,]\d*)?$/g)
    const isNumber = testStartValue && testStartValue.length === 1
    return !(!isNumber || isNaN(parseFloat(startVal)))
  }

  function isStartYearValid(value?: string) {
    const startYearValue = value || startYear.value
    const testStartYear = startYearValue.match(yearRegexp)
    const isStartYearValid = testStartYear && testStartYear.length === 1
    const intStartYear = parseInt(startYearValue)
    return !(
      !isStartYearValid ||
      isNaN(intStartYear) ||
      intStartYear < validMinYear ||
      intStartYear > Number(validMaxYear)
    )
  }

  function isEndYearValid(value?: string) {
    const endYearValue = value || endYear.value
    const testEndYear = endYearValue.match(yearRegexp)
    const isEndYearValid = testEndYear && testEndYear.length === 1
    const intEndYear = parseInt(endYearValue)
    return !(!isEndYearValid || isNaN(intEndYear) || intEndYear < validMinYear || intEndYear > Number(validMaxYear))
  }

  function isStartMonthValid(value?: string) {
    const startMonthValue = value || startMonth.value.id
    const startMonthValid = !(startYear.value === validMaxYear && startMonthValue > validMaxMonth)
    if (!startMonthValid) {
      setStartMonth({
        ...startMonth,
        error: true,
      })
    }
    return startMonthValid
  }

  function isEndMonthValid(value?: string) {
    const endMonthValue = value || endMonth.value.id
    const maxYearAverage = Number(validMaxMonth) === 12 ? validMaxYear : Number(validMaxYear) - 1
    const endMonthValid =
      endMonthValue === '90'
        ? endYear.value <= maxYearAverage
        : !(endYear.value === validMaxYear && endMonthValue > validMaxMonth)
    if (!endMonthValid) {
      setEndMonth({
        ...endMonth,
        error: true,
      })
    }
    return endMonthValid
  }

  function onBlur(id: string | number) {
    switch (id) {
      case 'start-value': {
        setStartValue({
          ...startValue,
          error: !isStartValueValid(),
        })
        break
      }
      case 'start-year': {
        setStartYear({
          ...startYear,
          error: !isStartYearValid(),
        })
        break
      }
      case 'end-year': {
        setEndYear({
          ...endYear,
          error: !isEndYearValid(),
        })
        break
      }
      default: {
        break
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onChange(id: string | number, value: any) {
    switch (id) {
      case 'start-value': {
        value = value.replace(/,/g, '.')
        setStartValue({
          ...startValue,
          value,
          error: startValue.error ? !isStartValueValid(value) : startValue.error,
        })
        break
      }
      case 'start-month': {
        setStartMonth({
          ...startMonth,
          value,
          error: startMonth.error ? !isStartMonthValid(value.id) : startMonth.error,
        })
        break
      }
      case 'start-year': {
        if (startMonth.error) {
          setStartMonth({
            ...startMonth,
            error: false,
          })
        }
        setStartYear({
          ...startYear,
          value,
          error: startYear.error ? !isStartYearValid(value) : startYear.error,
        })
        break
      }
      case 'end-month': {
        setEndMonth({
          ...endMonth,
          value,
          error: endMonth.error ? !isEndMonthValid(value.id) : endMonth.error,
        })
        break
      }
      case 'end-year': {
        if (endMonth.error) {
          setEndMonth({
            ...endMonth,
            error: false,
          })
        }
        setEndYear({
          ...endYear,
          value,
          error: endYear.error ? !isEndYearValid(value) : endYear.error,
        })
        break
      }
      default: {
        break
      }
    }
  }

  function addDropdownMonth(id: string | number) {
    return (
      <Dropdown
        className='period'
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value: object) => {
          onChange(id, value)
        }}
        error={startMonth.error}
        errorMessage={startMonth.errorMsg}
        selectedItem={startMonth.value}
        items={props.months}
      />
    )
  }

  function addDropdownEndMonth(id: string | number) {
    return (
      <Dropdown
        className='period'
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value: object) => {
          onChange(id, value)
        }}
        error={endMonth.error}
        errorMessage={endMonth.errorMsg}
        selectedItem={endMonth.value}
        items={props.months}
      />
    )
  }

  function getPeriod(year: string, month: string) {
    return month === '90' ? year : `${getMonthLabel(month)} ${year}`
  }

  function getMonthLabel(month: string) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title.toLowerCase() : ''
  }

  function renderNumberValute(value: string | number) {
    if (endValue && change) {
      const valute = language === 'en' ? 'NOK' : 'kr'
      const decimalSeparator = language === 'en' ? '.' : ','
      return (
        <React.Fragment>
          <NumericFormat
            value={Number(value)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={2}
            fixedDecimalScale
          />{' '}
          {valute}
        </React.Fragment>
      )
    }
  }

  function renderNumberChangeValue(changeValue: string | number) {
    if (endValue && change) {
      const decimalSeparator = language === 'en' ? '.' : ','
      return (
        <React.Fragment>
          <NumericFormat
            value={Number(changeValue)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={1}
            fixedDecimalScale
          />{' '}
          %
        </React.Fragment>
      )
    }
  }

  function calculatorResult() {
    const priceChangeLabel = change?.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
    const changeValue = change?.charAt(0) === '-' ? change.replace('-', '') : (change ?? '')
    const endValueText = endValue?.toString() ?? ''
    const resultScreenReader = props.phrases.kpiResultScreenReader
      .replace('{0}', language === 'en' ? endValueText : endValueText.replace(/\./g, ','))
      .replace('{1}', priceChangeLabel)
      .replace('{2}', language === 'en' ? changeValue : changeValue.replace(/\./g, ','))
      .replace('{3}', startPeriod as string)
      .replace('{4}', endPeriod as string)

    return (
      <Container className='calculator-result' ref={scrollAnchor}>
        <div aria-atomic='true'>
          <span className='sr-only'>{resultScreenReader}</span>
        </div>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='amount-equal align-self-end col-12 col-md-4'>
            <Title size={3}>{props.phrases.kpiAmountEqualled}</Title>
          </Col>
          <Col className='end-value col-12 col-md-8'>
            <span className='float-start float-md-end'>{renderNumberValute(endValue!)}</span>
          </Col>
          <Col className='col-12'>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='col-12 col-lg-4'>
            <span>{priceChangeLabel}</span>
            <span className='float-end'>{renderNumberChangeValue(changeValue!)}</span>
            <Divider dark />
          </Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {props.phrases.amount} {startPeriod}
            </span>
            <span className='float-end'>{renderNumberValute(startValueResult!)}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {props.phrases.amount} {endPeriod}
            </span>
            <span className='float-end'>{renderNumberValute(endValue!)}</span>
            <Divider dark />
          </Col>
        </Row>
        <Row className='my-4'>
          <Col className='col-12 col-md-8'>
            <span className='info-title'>{props.phrases.kpiCalculatorInfoTitle}</span>
            <p className='info-text'>{props.phrases.kpiCalculatorInfoText}</p>
          </Col>
        </Row>
        <Row>
          <Col className='md-6'>
            <Button className='close-button' onClick={() => closeResult()} type='button'>
              {' '}
              <X size='18' />
              {props.phrases.close}
            </Button>
          </Col>
        </Row>
      </Container>
    )
  }

  function calculatorResultFrontpage() {
    const priceChangeLabel = change?.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
    const changeValue = change?.charAt(0) === '-' ? change.replace('-', '') : (change ?? '')
    const endValueText = endValue?.toString() ?? ''
    const resultScreenReader = props.phrases.kpiResultFrontpageScreenReader
      .replace('{0}', language === 'en' ? endValueText : endValueText.replace(/\./g, ','))
      .replace('{1}', priceChangeLabel)
      .replace('{2}', language === 'en' ? changeValue : changeValue.replace(/\./g, ','))
    return (
      <Container className='calculator-result-frontpage' ref={scrollAnchor}>
        <div aria-live='polite' aria-atomic='true'>
          <span className='sr-only'>{resultScreenReader}</span>
        </div>
        <Row className='mb-3' aria-hidden='true'>
          <Col className='amount-equal align-self-end col-12 col-lg-5'>
            <Title size={3}>{props.phrases.amountEqualled}</Title>
          </Col>
          <Col className='end-value col-12 col-lg-7'>
            <span className='float-lg-end'>{renderNumberValute(endValue!)}</span>
          </Col>
          <Col className='col-12'>
            <Divider dark />
          </Col>
        </Row>
        <Row aria-hidden='true'>
          <Col className='col-12'>
            <span>{priceChangeLabel} </span>
            <span>{renderNumberChangeValue(changeValue!)}</span>
          </Col>
        </Row>
        <Row aria-live='off'>
          <Col className='md-6'>
            <button className='ssb-btn close-button' onClick={() => closeResult()} autoFocus>
              {' '}
              <X size='18' />
              {props.phrases.close}
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
    if (errorMessage !== null) {
      return (
        <Container className='calculator-error'>
          <Row>
            <Col>
              <FormError
                errorMessages={[errorMessage || props.phrases.calculatorUknownError]}
                title={props.phrases.calculatorErrorCalculationFailed}
              />
            </Col>
          </Row>
        </Container>
      )
    }
    if (endValue && change) {
      return props.frontPage ? calculatorResultFrontpage() : calculatorResult()
    }
  }

  function renderLinkArticle() {
    if (props.calculatorArticleUrl) {
      return (
        <Col className='article-link align-self-center col-12 col-md-6'>
          <Link className='float-md-end' href={props.calculatorArticleUrl}>
            {props.phrases.readAboutCalculator}
          </Link>
        </Col>
      )
    }
  }

  function renderLinkArticleFrontpage() {
    if (props.calculatorArticleUrl) {
      return (
        <Col className='article-link col-12 col-lg-6 d-lg-flex align-self-center justify-content-end'>
          <Link className='float-lg-end' href={props.calculatorArticleUrl} standAlone>
            {props.phrases.readAboutCalculator}
          </Link>
        </Col>
      )
    }
  }

  function renderIngressFrontpage() {
    if (props.frontPageIngress) {
      return (
        <div
          className='publish-text pb-2'
          dangerouslySetInnerHTML={{
            __html: sanitize(props.frontPageIngress),
          }}
        />
      )
    }
  }

  function renderCalculator() {
    if (props.frontPage) {
      return (
        <section className='kpi-calculator frontpage'>
          <Container className='content'>
            {renderFormFrontpage()}
            {renderResult()}
          </Container>
        </section>
      )
    } else {
      return (
        <section className='kpi-calculator'>
          <Container className='calculator-content'>
            {renderForm()}
            <div aria-live='polite'>{renderResult()}</div>
          </Container>
        </section>
      )
    }
  }

  function renderForm() {
    return (
      <div className='calculator-form'>
        <Row>
          <Col className='col-12 col-md-6'>
            <Title size={2}>{props.phrases.calculatePriceChange}</Title>
          </Col>
          {renderLinkArticle()}
        </Row>
        <Row>
          <Col className='col-12 col-md-8'>
            <p className='publish-text'>{props.nextPublishText}</p>
          </Col>
        </Row>
        <Form onSubmit={onSubmit}>
          <Container>
            <Row>
              <Col className='input-amount'>
                <h3 id='enter-amount'>{props.phrases.enterAmount}</h3>
                <Input
                  className='start-value'
                  handleChange={(value: string) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                  ariaLabelledBy='enter-amount'
                />
              </Col>
            </Row>
            <Row>
              <Col className='calculate-from col-12 col-lg-6'>
                <Title size={3}>{props.phrases.calculatePriceChangeFrom}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={props.phrases.fromYear}
                        ariaLabel={props.phrases.fromYearScreenReader}
                        handleChange={(value: string) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                    <Col className='select-period col-12 col-sm-7'>{addDropdownMonth('start-month')}</Col>
                  </Row>
                </Container>
              </Col>
              <Col className='calculate-to col-12 col-lg-6'>
                <Title size={3}>{props.phrases.calculatePriceChangeTo}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={props.phrases.toYear}
                        ariaLabel={props.phrases.toYearScreenReader}
                        handleChange={(value: string) => onChange('end-year', value)}
                        error={endYear.error}
                        errorMessage={endYear.errorMsg}
                        onBlur={() => onBlur('end-year')}
                      />
                    </Col>
                    <Col className='select-period col-12 col-sm-7'>{addDropdownEndMonth('end-month')}</Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className='submit'>
              <Col>
                <Button className='submit-button' primary type='submit' disabled={loading}>
                  {props.phrases.seePriceChange}
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    )
  }

  function renderFormFrontpage() {
    return (
      <Row className='calculator-form-frontpage'>
        <Col className='col-12'>
          <Row className='d-flex flex-column'>
            <Col className='col-12 col-lg-10 p-0'>
              <Title size={2}>{props.phrases.calculatePriceChange}</Title>
              {renderIngressFrontpage()}
            </Col>
          </Row>
        </Col>
        <Form onSubmit={onSubmit} className='col-12 p-0'>
          <Row className='calculator-input'>
            <Col className='input-amount col-12 col-lg-4'>
              <Input
                className='start-value'
                label={props.phrases.enterAmount}
                handleChange={(value: string) => onChange('start-value', value)}
                error={startValue.error}
                errorMessage={startValue.errorMsg}
                onBlur={() => onBlur('start-value')}
              />
            </Col>
            <Col className='calculate-from col-12 col-lg-4'>
              <Row>
                <Col className='select-year'>
                  <Input
                    className='input-year'
                    label={props.phrases.fromYear}
                    handleChange={(value: string) => onChange('start-year', value)}
                    error={startYear.error}
                    errorMessage={startYear.errorMsg}
                    onBlur={() => onBlur('start-year')}
                  />
                </Col>
                <Col className='select-period'>{addDropdownMonth('start-month')}</Col>
              </Row>
            </Col>
            <Col className='calculate-to col-12 col-lg-4'>
              <Row>
                <Col className='select-year'>
                  <Input
                    className='input-year'
                    label={props.phrases.toYear}
                    handleChange={(value: string) => onChange('end-year', value)}
                    error={endYear.error}
                    errorMessage={endYear.errorMsg}
                    onBlur={() => onBlur('end-year')}
                  />
                </Col>
                <Col className='select-period'>{addDropdownEndMonth('end-month')}</Col>
              </Row>
            </Col>
          </Row>
          <Row className='submit'>
            <Col>
              <Button className='submit-button' primary type='submit' disabled={loading}>
                {props.phrases.seePriceChange}
              </Button>
            </Col>
            {renderLinkArticleFrontpage()}
          </Row>
        </Form>
      </Row>
    )
  }

  return renderCalculator()
}

KpiCalculator.defaultValue = {
  kpiServiceUrl: null,
  language: 'nb',
}

export default (props: KpiCalculatorProps) => <KpiCalculator {...props} />
