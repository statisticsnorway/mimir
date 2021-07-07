import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, FormError, Link, Title, Dialog } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import NumberFormat from 'react-number-format'
import moment from 'moment/min/moment-with-locales'

function HusleieCalculator(props) {
  const validMaxYear = props.lastUpdated.year
  const validMaxMonth = props.lastUpdated.month

  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: props.phrases.husleieValidateAmountNumber,
    value: ''
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: ''
  })
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: `${props.phrases.husleieValidateYear} ${validMaxYear}`,
    value: ''
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: validMaxMonth
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: `${props.phrases.husleieValidateYear} ${validMaxYear}`,
    value: validMaxYear
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState(null)
  const [change, setChange] = useState(null)
  // const [monthsLastAdjusted, setMonthsLastAdjusted] = useState(null)
  const [choosenPeriod, setChoosenPeriod] = useState(false)
  const language = props.language ? props.language : 'nb'
  const [rentAdjustedOverAYearAgo, setRentAdjustedOverAYearAgo] = useState(false)
  const [rentAdjustedUnderAYearAgo, setRentAdjustedUnderAYearAgo] = useState(false)

  const validMinYear = 1865
  const yearRegexp = /^[1-9]{1}[0-9]{3}$/g

  function onSubmit(e) {
    e.preventDefault()
    if (loading) return
    setChange(null)
    setEndValue(null)
    setRentAdjustedUnderAYearAgo(false)
    setRentAdjustedOverAYearAgo(false)

    if (!isFormValid()) {
      onBlur('start-value')
      onBlur('start-year')
      return
    }

    setErrorMessage(null)
    setLoading(true)
    getServiceData(endMonth.value, endYear.value)
  }

  function isFormValid() {
    return isStartValueValid() && isStartYearValid() && isStartMonthValid() && isRentPeriodValid()
  }

  function getServiceData(endMonth, endYear) {
    axios.get(props.husleieServiceUrl, {
      params: {
        startValue: startValue.value,
        startYear: startYear.value,
        startMonth: startMonth.value,
        endYear: endYear,
        endMonth: endMonth,
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

  function submitOneYearLater() {
    const yearAfter = Number(startYear.value) + 1
    setChoosenPeriod(true)
    setEndMonth({
      ...endMonth,
      value: startMonth.value
    })

    setEndYear({
      ...endYear,
      value: yearAfter.toString()
    })
    getServiceData(startMonth.value, yearAfter.toString())
  }

  function submitLastPeriod() {
    setChoosenPeriod(true)
    setEndMonth({
      ...endMonth,
      value: validMaxMonth
    })

    setEndYear({
      ...endYear,
      value: validMaxYear
    })
    getServiceData(validMaxMonth, validMaxYear)
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

  function isStartMonthValid(value) {
    const startMonthValue = value || startMonth.value
    const startMonthValid = !((startYear.value === validMaxYear) && (startMonthValue > validMaxMonth))
    if (!startMonthValid) {
      setStartMonth({
        ...startMonth,
        error: true
      })
    }
    return startMonthValid
  }

  function isRentPeriodValid() {
    const from = '01/' + startMonth.value + '/' + startYear.value
    const to = '01/' + validMaxMonth + '/' + validMaxYear
    const monthDifference = moment(new Date(to)).diff(new Date(from), 'months', true)

    const periodUnderValid = !(monthDifference < 12)
    const periodOverValid = !(monthDifference > 12)
    const periodValid = monthDifference === 12

    if (!periodUnderValid) {
      setRentAdjustedUnderAYearAgo(true)
    }

    if (!periodOverValid) {
      setRentAdjustedOverAYearAgo(true)
    }
    return periodValid
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
        value: value.id,
        error: startMonth.error ? !isStartMonthValid(value.id) : startMonth.error
      })
      break
    }
    case 'start-year': {
      if (startMonth.error) {
        setStartMonth({
          ...startMonth,
          error: false
        })
      }
      setStartYear({
        ...startYear,
        value,
        error: startYear.error ? !isStartYearValid(value) : startYear.error
      })
      break
    }
    default: {
      break
    }
    }
  }

  function getMonthLabel(month) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title : ''
  }

  function renderNumberValute(value) {
    if (endValue && change) {
      const valute = (language === 'en') ? 'NOK' : 'kr'
      const decimalSeparator = (language === 'en') ? '.' : ','
      return (
        <React.Fragment>
          <NumberFormat
            value={ Number(value) }
            displayType={'text'}
            thousandSeparator={' '}
            decimalSeparator={decimalSeparator}
            decimalScale={2}
            fixedDecimalScale={true}
          /> {valute}
        </React.Fragment>
      )
    }
  }

  function renderNumberChangeValue() {
    if (endValue && change) {
      const changeValue = change.charAt(0) === '-' ? change.replace('-', '') : change
      const decimalSeparator = (language === 'en') ? '.' : ','
      return (
        <React.Fragment>
          <NumberFormat
            value={ Number(changeValue) }
            displayType={'text'}
            thousandSeparator={' '}
            decimalSeparator={decimalSeparator}
            decimalScale={1}
            fixedDecimalScale={true}
          /> %
        </React.Fragment>
      )
    }
  }

  function calculatorResult() {
    const phraseTo = language === 'en' ? 'to' : 'til'
    const phraseResultText = `${props.phrases.husleieAppliesFor} ${getMonthLabel(startMonth.value).toLowerCase()}
     ${startYear.value} ${phraseTo} ${getMonthLabel(endMonth.value).toLowerCase()} ${endYear.value}`
    return (
      <Container className="calculator-result">
        <Row className="mb-5">
          <Col className="amount-equal align-self-end col-12 col-md-4">
            <Title size={3}>{props.phrases.husleieNewRent}</Title>
          </Col>
          <Col className="end-value col-12 col-md-8">
            <span className="float-left float-md-right">
              {renderNumberValute(endValue)}
            </span>
          </Col>
          <Col className="col-12">
            <Divider dark/>
          </Col>
        </Row>
        <Row className="mb-5">
          <Col className="price-increase col-12 col-lg-4">
            <span>{props.phrases.calculatorChange}</span>
            <span className="float-right">
              {renderNumberChangeValue()}
            </span>
            <Divider dark/>
          </Col>
          <Col className="price-increase col-12 col-lg-4">
            <span>{phraseResultText}</span>
          </Col>
        </Row>
      </Container>
    )
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
      return (
        calculatorResult()
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

  function renderChooseHusleiePeriode() {
    if (rentAdjustedOverAYearAgo) {
      const phraseOneYearLater = getMonthLabel(startMonth.value) + ' ' + (Number(startYear.value) + 1).toString()
      const newestNumbers = getMonthLabel(validMaxMonth) + ' ' + validMaxYear + ' (' + props.phrases.husleieLatestFigures + ' )'
      return (
        <Container>
          <Divider className="my-5"/>
          <Row>
            <Title size={3} className="col-12 mb-2">{props.phrases.husleieValidateOver1Year}</Title>
            <p className="col-12 mb-2">{props.phrases.husleieChooseFiguresToCalculateRent}</p>
          </Row>
          <Row className="ml-0">
            <Button className="submit-button mr-4" onClick={submitOneYearLater}>{phraseOneYearLater}</Button>
            <Button className="submit-button" onClick={submitLastPeriod}>{newestNumbers}</Button>
          </Row>
        </Container>
      )
    }
  }

  function renderAlertUnderAYearAgo() {
    if (rentAdjustedUnderAYearAgo) {
      return (
        <Col className="col-12 col-md-9 pl-0 mt-4">
          <Dialog type='info' title='Det er mindre enn 12 måneder siden du endret husleien'>
          I følge Husleieloven kan du tidligst endre husleie i mars 2021. Tall for mars 2021 kommer ca 10. april 2021.
          </Dialog>
        </Col>
      )
    }
  }

  function renderCalculator() {
    return (
      <Container className='husleie-calculator'>
        {renderForm()}
        {renderResult()}
      </Container>
    )
  }

  function renderForm() {
    return (
      <div className="calculator-form">
        <Row>
          <Col className="col-12 col-md-6">
            <Title size={2}>{props.phrases.calculatePriceChange}</Title>
          </Col>
          {renderLinkArticle()}
        </Row>
        <Row>
          <Col className="col-12 col-md-9">
            <p className="publish-text">{props.nextPublishText}</p>
          </Col>
        </Row>
        {renderAlertUnderAYearAgo()}
        <Form onSubmit={onSubmit}>
          <Container>
            <Row>
              <Col className="input-amount">
                <Title size={3}>{props.phrases.husleieRentToday}</Title>
                <Input
                  className="start-value"
                  label={props.phrases.enterAmount}
                  handleChange={(value) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                />
              </Col>
            </Row>
            <Row>
              <Col className="calculate-from col-12 col-sm-6">
                <Title size={3}>{props.phrases.husleieLastAdjust}</Title>
                <Container>
                  <Row>
                    <Col className="select-month col-sm-8">
                      <Dropdown
                        className="month"
                        id='start-month'
                        header={props.phrases.chooseMonth}
                        onSelect={(value) => {
                          onChange('start-month', value)
                        }}
                        placeholder={props.phrases.chooseMonth}
                        error={startMonth.error}
                        errorMessage={startMonth.errorMsg}
                        items={props.months}
                      />
                    </Col>
                    <Col className="select-year col-sm-4">
                      <Input
                        className="input-year"
                        label={props.phrases.fromYear}
                        handleChange={(value) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className="submit">
              <Col>
                <Button className="submit-button" primary type="submit" disabled={loading}>{props.phrases.husleieSubmit}</Button>
              </Col>
            </Row>
            {renderChooseHusleiePeriode()}
          </Container>
        </Form>
      </div>
    )
  }

  return (
    renderCalculator()
  )
}

HusleieCalculator.defaultValue = {
  husleieServiceUrl: null,
  language: 'nb'
}

HusleieCalculator.propTypes = {
  husleieServiceUrl: PropTypes.string,
  language: PropTypes.string,
  months: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string
    })
  ),
  phrases: PropTypes.object,
  calculatorArticleUrl: PropTypes.string,
  nextPublishText: PropTypes.string,
  lastNumberText: PropTypes.string,
  lastUpdated: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.string
  })
}

export default (props) => <HusleieCalculator {...props} />
