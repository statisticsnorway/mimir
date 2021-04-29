import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, FormError, Link } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import NumberFormat from 'react-number-format'

function KpiCalculator(props) {
  const maxYear = props.lastUpdated.year
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: props.phrases.kpiValidateAmountNumber,
    value: ''
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.phrases.kpiValidateMonth,
    value: '90'
  })
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: `${props.phrases.kpiValidateYear} ${maxYear}`,
    value: ''
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: props.phrases.kpiValidateMonth,
    value: '90'
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: `${props.phrases.kpiValidateYear} ${maxYear}`,
    value: ''
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState(null)
  const [change, setChange] = useState(null)
  const [startPeriod, setStartPeriod] = useState(null)
  const [endPeriod, setEndPeriod] = useState(null)
  const [startValueResult, setStartValueResult] = useState(null)
  const language = props.language ? props.language : 'nb'

  const validMaxYear = new Date().getFullYear()
  const validMinYear = 1865
  const yearRegexp = /^[1-9]{1}[0-9]{3}$/g

  function onSubmit(e) {
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
    axios.get(props.kpiServiceUrl, {
      params: {
        startValue: startValue.value,
        startYear: startYear.value,
        startMonth: startMonth.value,
        endYear: endYear.value,
        endMonth: endMonth.value,
        language: language
      }
    })
      .then((res) => {
        const changeVal = (res.data.change * 100).toFixed(1)
        const endVal = (res.data.endValue).toFixed(2)
        const startPeriod = getPeriod(startYear.value, startMonth.value)
        const endPeriod = getPeriod(endYear.value, endMonth.value)
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
      .finally(()=> {
        setLoading(false)
      })
  }

  function isFormValid() {
    return isStartValueValid() && isStartYearValid() && isEndYearValid()
  }

  function isStartValueValid(value) {
    const startVal = value || startValue.value
    const testStartValue = startVal.match(/^-?[0-9]+[.,]?[0-9]*$/g)
    const isNumber = testStartValue && testStartValue.length === 1
    return !(!isNumber || isNaN(parseFloat(startVal)))
  }

  function isStartYearValid(value) {
    const startYearValue = value || startYear.value
    const testStartYear = startYearValue.match(yearRegexp)
    const isStartYearValid = testStartYear && testStartYear.length === 1
    const intStartYear = parseInt(startYearValue)
    return !(!isStartYearValid || isNaN(intStartYear) || intStartYear < validMinYear || intStartYear > validMaxYear)
  }

  function isEndYearValid(value) {
    const endYearValue = value || endYear.value
    const testEndYear = endYearValue.match(yearRegexp)
    const isEndYearValid = testEndYear && testEndYear.length === 1
    const intEndYear = parseInt(endYearValue)
    return !(!isEndYearValid || isNaN(intEndYear) || intEndYear < validMinYear || intEndYear > validMaxYear)
  }

  function onBlur(id) {
    switch (id) {
    case 'start-value': {
      setStartValue({
        ...startValue,
        error: !isStartValueValid()
      })
      break
    }
    case 'start-year': {
      setStartYear({
        ...startYear,
        error: !isStartYearValid()
      })
      break
    }
    case 'end-year': {
      setEndYear({
        ...endYear,
        error: !isEndYearValid()
      })
      break
    }
    default: {
      break
    }
    }
  }

  function onChange(id, value) {
    switch (id) {
    case 'start-value': {
      value = value.replace(/,/g, '.')
      setStartValue({
        ...startValue,
        value,
        error: startValue.error ? !isStartValueValid(value) : startValue.error
      })
      break
    }
    case 'start-month': {
      setStartMonth({
        ...startMonth,
        value: value.id
      })
      break
    }
    case 'start-year': {
      setStartYear({
        ...startYear,
        value,
        error: startYear.error ? !isStartYearValid(value) : startYear.error
      })
      break
    }
    case 'end-month': {
      setEndMonth({
        ...endMonth,
        value: value.id
      })
      break
    }
    case 'end-year': {
      setEndYear({
        ...endYear,
        value,
        error: endYear.error ? !isEndYearValid(value) : endYear.error
      })
      break
    }
    default: {
      break
    }
    }
  }

  function addDropdownMonth(id) {
    return (
      <Dropdown
        className="month"
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value) => {
          onChange(id, value)
        }}
        selectedItem={{
          title: props.frontPage ? props.phrases.calculatorMonthAverageFrontpage : props.phrases.calculatorMonthAverage,
          id: '90'
        }}
        items={props.months}
      />
    )
  }

  function getPeriod(year, month) {
    return month === '90' ? year : `${getMonthLabel(month)} ${year}`
  }

  function getMonthLabel(month) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title.toLowerCase() : ''
  }

  function renderResult() {
    if (loading) {
      return (
        <Container>
          <span className="spinner-border spinner-border" />
        </Container>
      )
    }
    if (errorMessage !== null) {
      return (
        <Container className="calculator-error" >
          <Row>
            <Col>
              <FormError errorMessages={[errorMessage || props.phrases.kpiErrorUnknownError]} title={props.phrases.kpiErrorCalculationFailed} />
            </Col>
          </Row>
        </Container>
      )
    }
    if (endValue && change) {
      const decimalSeparator = (language === 'en') ? '.' : ','
      const valute = (language === 'en') ? 'NOK' : 'kr'
      const priceChangeLabel = change.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
      const changeValue = change.charAt(0) === '-' ? change.replace('-', '') : change
      return (
        <Container className="calculator-result">
          <Row className="mb-5">
            <Col className="amount-equal align-self-end col-12 col-md-4">
              <h3>{props.phrases.kpiAmountEqualled}</h3>
            </Col>
            <Col className="end-value col-12 col-md-8">
              <span className="float-right">
                <NumberFormat
                  value={ Number(endValue) }
                  displayType={'text'}
                  thousandSeparator={' '}
                  decimalSeparator={decimalSeparator}
                  decimalScale={2}
                  fixedDecimalScale={true}
                /> {valute}
              </span>
            </Col>
            <Col className="col-12">
              <Divider dark/>
            </Col>
          </Row>
          <Row className="mb-5">
            <Col className="price-increase col-12 col-md-4">
              <span>{priceChangeLabel}</span>
              <span className="float-right">
                <NumberFormat
                  value={ Number(changeValue) }
                  displayType={'text'}
                  thousandSeparator={' '}
                  decimalSeparator={decimalSeparator}
                  decimalScale={1}
                  fixedDecimalScale={true}
                /> %
              </span>
              <Divider dark/>
            </Col>
            <Col className="start-value col-12 col-md-4">
              <span>{props.phrases.amount} {startPeriod}</span>
              <span className="float-right">
                <NumberFormat
                  value={ Number(startValueResult) }
                  displayType={'text'}
                  thousandSeparator={' '}
                  decimalSeparator={decimalSeparator}
                  decimalScale={2}
                  fixedDecimalScale={true}
                /> {valute}
              </span>
              <Divider dark/>
            </Col>
            <Col className="amount col-12 col-md-4">
              <span>{props.phrases.amount} {endPeriod}</span>
              <span className="float-right">
                <NumberFormat
                  value={ Number(endValue) }
                  displayType={'text'}
                  thousandSeparator={' '}
                  decimalSeparator={decimalSeparator}
                  decimalScale={2}
                  fixedDecimalScale={true}
                /> {valute}
              </span>
              <Divider dark/>
            </Col>
          </Row>
          <Row className="my-4">
            <Col className="col-12 col-md-8">
              <span className="info-title">{props.phrases.kpiCalculatorInfoTitle}</span>
              <p className="info-text">{props.phrases.kpiCalculatorInfoText}</p>
            </Col>
          </Row>
        </Container>
      )
    }
  }

  function renderResultFrontpage() {
    if (loading) {
      return (
        <Container>
          <span className="spinner-border spinner-border" />
        </Container>
      )
    }
    if (errorMessage !== null) {
      return (
        <Container className="calculator-error frontpage" >
          <Row>
            <Col>
              <FormError errorMessages={[errorMessage || props.phrases.kpiErrorUnknownError]} title={props.phrases.kpiErrorCalculationFailed} />
            </Col>
          </Row>
        </Container>
      )
    }
    if (endValue && change) {
      const decimalSeparator = (language === 'en') ? '.' : ','
      const valute = (language === 'en') ? 'NOK' : 'kr'
      const priceChangeLabel = change.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
      const changeValue = change.charAt(0) === '-' ? change.replace('-', '') : change
      return (
        <Container className="calculator-result-frontpage">
          <Row className="mb-3">
            <Col className="amount-equal align-self-end col-12 col-md-4">
              <h3>{props.phrases.kpiAmountEqualled}</h3>
            </Col>
            <Col className="end-value col-12 col-md-8">
              <span className="float-right">
                <NumberFormat
                  value={ Number(endValue) }
                  displayType={'text'}
                  thousandSeparator={' '}
                  decimalSeparator={decimalSeparator}
                  decimalScale={2}
                  fixedDecimalScale={true}
                /> {valute}
              </span>
            </Col>
            <Col className="col-12">
              <Divider dark/>
            </Col>
          </Row>
          <Row>
            <Col className="price-increase col-12 col-md-4">
              <span>{priceChangeLabel}</span>
              <span className="float-right">
                <NumberFormat
                  value={ Number(changeValue) }
                  displayType={'text'}
                  thousandSeparator={' '}
                  decimalSeparator={decimalSeparator}
                  decimalScale={1}
                  fixedDecimalScale={true}
                /> %
              </span>
            </Col>
          </Row>
        </Container>
      )
    }
  }

  function renderLinkArticle() {
    if (props.calculatorArticleUrl) {
      return (
        <Col className="article-link align-self-center col-12 col-md-6">
          <Link className="float-md-right" href={props.calculatorArticleUrl}>{props.phrases.readAboutCalculator}</Link>
        </Col>
      )
    }
  }

  function renderIngressFrontpage() {
    if (props.frontPageIngress) {
      return (
        <Row>
          <Col className="publish-text pb-2"
            dangerouslySetInnerHTML={{
              __html: props.frontPageIngress
            }}
          />
        </Row>
      )
    }
  }

  function renderCalculator() {
    if (props.frontPage) {
      return (
        <Container className='kpi-calculator frontpage'>
          {renderFormFrontpage()}
          {renderResultFrontpage()}
        </Container>
      )
    } else {
      return (
        <Container className='kpi-calculator'>
          {renderForm()}
          {renderResult()}
        </Container>
      )
    }
  }

  function renderForm() {
    return (
      <div className="calculator-form">
        <Row>
          <Col>
            <h2>{props.phrases.calculatePriceChange}</h2>
          </Col>
          {renderLinkArticle()}
        </Row>
        <Row>
          <Col className="col-12 col-md-8">
            <p className="publish-text">{props.nextPublishText}</p>
          </Col>
        </Row>
        <Form onSubmit={onSubmit}>
          <Container>
            <Row>
              <Col className="input-amount">
                <h3>{props.phrases.enterAmount}</h3>
                <Input
                  className="start-value"
                  handleChange={(value) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <h3>{props.phrases.calculatePriceChangeFrom}</h3>
                <Container className="calculate-from">
                  <Row>
                    <Col className="select-month">
                      {addDropdownMonth('start-month')}
                    </Col>
                    <Col className="select-year align-self-end">
                      <Input
                        className="input-year"
                        label={props.phrases.enterYear}
                        handleChange={(value) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col>
                <h3>{props.phrases.calculatePriceChangeTo}</h3>
                <Container className="calculate-to">
                  <Row>
                    <Col className="select-month">
                      {addDropdownMonth('end-month')}
                    </Col>
                    <Col className="select-year align-self-end">
                      <Input
                        className="input-year"
                        label={props.phrases.enterYear}
                        handleChange={(value) => onChange('end-year', value)}
                        error={endYear.error}
                        errorMessage={endYear.errorMsg}
                        onBlur={() => onBlur('end-year')}
                      />
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className="submit">
              <Col>
                <Button primary type="submit" disabled={loading}>{props.phrases.seePriceChange}</Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    )
  }

  function renderFormFrontpage() {
    return (
      <div className="calculator-form-frontpage">
        <Row>
          <Col>
            <h2>{props.phrases.calculatePriceChange}</h2>
          </Col>
        </Row>
        {renderIngressFrontpage()}
        <Form onSubmit={onSubmit}>
          <Container>
            <Row className="calculator-input">
              <Col className="input-amount col-12 col-md-4">
                <Input
                  className="start-value"
                  label={props.phrases.enterAmount}
                  handleChange={(value) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                />
              </Col>
              <Col className="calculate-from col-12 col-md-4">
                <Container>
                  <Row className="mr-3">
                    <Col className="select-year align-self-end p-0">
                      <Input
                        className="input-year"
                        label='Fra år(åååå)'
                        handleChange={(value) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                    <Col className="select-month p-0">
                      {addDropdownMonth('start-month')}
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col className="calculate-to col-12 col-md-4">
                <Container>
                  <Row>
                    <Col className="select-year align-self-end p-0">
                      <Input
                        className="input-year"
                        label='Til år(åååå)'
                        handleChange={(value) => onChange('end-year', value)}
                        error={endYear.error}
                        errorMessage={endYear.errorMsg}
                        onBlur={() => onBlur('end-year')}
                      />
                    </Col>
                    <Col className="select-month  p-0">
                      {addDropdownMonth('end-month')}
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className="submit">
              <Col>
                <Button primary type="submit" disabled={loading}>{props.phrases.seePriceChange}</Button>
              </Col>
              {renderLinkArticle()}
            </Row>
          </Container>
        </Form>
      </div>
    )
  }

  return (
    <Container className='kpi-calculator'>
      {renderCalculator()}
    </Container>
  )
}

KpiCalculator.defaultValue = {
  kpiServiceUrl: null,
  language: 'nb'
}

KpiCalculator.propTypes = {
  kpiServiceUrl: PropTypes.string,
  language: PropTypes.string,
  months: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string
    })
  ),
  phrases: PropTypes.arrayOf(PropTypes.string),
  calculatorArticleUrl: PropTypes.string,
  nextPublishText: PropTypes.string,
  lastUpdated: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.string
  }),
  frontPage: PropTypes.bool,
  frontPageIngress: PropTypes.string
}

export default (props) => <KpiCalculator {...props} />
