import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, FormError } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import NumberFormat from 'react-number-format'

function KpiCalculator(props) {
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
    errorMsg: props.phrases.kpiValidateYear,
    value: ''
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: props.phrases.kpiValidateMonth,
    value: '90'
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: props.phrases.kpiValidateYear,
    value: ''
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState(null)
  const [change, setChange] = useState(null)
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
        setChange(changeVal)
        setEndValue(endVal)
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
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value) => {
          onChange(id, value)
        }}
        selectedItem={{
          title: props.phrases.calculatorMonthAverage,
          id: '90'
        }}
        items={props.months}
      />
    )
  }

  function renderResult() {
    if (loading) {
      return (
        <span className="spinner-border spinner-border" />
      )
    }
    if (errorMessage !== null) {
      return (
        <Row>
          <Col>
            <FormError errorMessages={[errorMessage || props.phrases.kpiErrorUnknownError]} title={props.phrases.kpiErrorCalculationFailed} />
          </Col>
        </Row>
      )
    }
    if (endValue && change) {
      const decimalSeparator = (language === 'en') ? '.' : ','
      const valute = (language === 'en') ? 'NOK' : 'kr'
      return (
        <React.Fragment>
          <Row>
            <Col className="col-10">
              <h3>{props.phrases.kpiAmountEqualled}</h3>
            </Col>
            <Col className="col-2">
              <NumberFormat
                value={ Number(endValue) }
                displayType={'text'}
                thousandSeparator={' '}
                decimalSeparator={decimalSeparator}
                decimalScale={2}
                fixedDecimalScale={true}
              /> {valute}
            </Col>
            <Col className="col-12">
              <Divider dark/>
            </Col>
          </Row>
          <Row>
            <Col>
              {props.phrases.priceIncrease} <NumberFormat
                value={ Number(change) }
                displayType={'text'}
                thousandSeparator={' '}
                decimalSeparator={decimalSeparator}
                decimalScale={1}
                fixedDecimalScale={true}
              /> %
            </Col>
            <Col>
              {props.phrases.startValue} <NumberFormat
                value={ Number(startValue.value) }
                displayType={'text'}
                thousandSeparator={' '}
                decimalSeparator={decimalSeparator}
                decimalScale={2}
                fixedDecimalScale={true}
              /> {valute}
            </Col>
            <Col>
              {props.phrases.amount} <NumberFormat
                value={ Number(endValue) }
                displayType={'text'}
                thousandSeparator={' '}
                decimalSeparator={decimalSeparator}
                decimalScale={2}
                fixedDecimalScale={true}
              /> {valute}
            </Col>
          </Row>
          <Row className="my-4">
            <Col className="col-6">
              <span>{props.phrases.kpiCalculatorInfoTitle}</span>
              <p>{props.phrases.kpiCalculatorInfoText}</p>
            </Col>
          </Row>
        </React.Fragment>
      )
    }
  }

  return (<Container>
    <h2>{props.phrases.calculatePriceChange}</h2>
    <p>{props.phrases.kpiNextPublishText}</p>
    <Form onSubmit={onSubmit}>
      <Container>
        <Row>
          <Col>
            <h3>{props.phrases.enterAmount}</h3>
            <Input
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
            <Container>
              <Row>
                <Col className="col-8">
                  {addDropdownMonth('start-month')}
                </Col>
                <Col className="col-4">
                  <Input
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
            <Container>
              <Row>
                <Col className="col-8">
                  {addDropdownMonth('end-month')}
                </Col>
                <Col className="col-4">
                  <Input
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
        <Row className="my-4">
          <Col>
            <Button primary type="submit" disabled={loading}>{props.phrases.calculatePriceChange}</Button>
          </Col>
        </Row>
      </Container>
    </Form>
    <Container>
      {renderResult()}
    </Container>
  </Container>)
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
  phrases: PropTypes.arrayOf(PropTypes.string)
}

export default (props) => <KpiCalculator {...props} />
