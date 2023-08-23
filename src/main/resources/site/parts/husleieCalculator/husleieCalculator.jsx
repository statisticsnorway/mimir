import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import {
  Input,
  Button,
  Dropdown,
  Divider,
  FormError,
  Link,
  Title,
  Dialog,
} from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import NumberFormat from 'react-number-format'

function HusleieCalculator(props) {
  const validMaxYear = props.lastUpdated.year
  const validMaxMonth = props.lastUpdated.month

  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateAmountNumber,
    value: '',
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateDropdownMonth,
    value: '',
  })
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: `${props.phrases.husleieValidateYear} ${validMaxYear}`,
    value: '',
  })
  const defaultAdjustRentWarning = {
    warning: false,
    warningTitle: '',
    warningMsg: '',
  }
  const [adjustRentWarning, setAdjustRentWarning] = useState(defaultAdjustRentWarning)
  const [chooseFiguresToCalculateRent, setChooseFiguresToCalculateRent] = useState({
    startValue: '',
    startMonth: '',
    startYear: '',
    oneYearLater: {
      phraseOneYearLater: '',
      endYear: '',
    },
    newestNumbersPhrase: '',
  })

  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState(null)
  const [change, setChange] = useState(null)
  const language = props.language ? props.language : 'nb'
  const [choosePeriod, setChoosePeriod] = useState(false)
  const [resultText, setResultText] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const validMinYear = 1950
  const yearRegexp = /^[1-9]{1}[0-9]{3}$/g

  const scrollAnchor = useRef(null)
  useEffect(() => {
    if (!loading && scrollAnchor.current !== null) {
      scrollAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [loading, choosePeriod])

  const submitButton = useRef(null)

  function onSubmit(e) {
    e.preventDefault()
    if (loading) return
    setChange(null)
    setEndValue(null)
    setAdjustRentWarning(defaultAdjustRentWarning)

    const calculateRentStartMonth = startMonth.value
    const calculatorRentYear = Number(startYear.value)
    const calculatorRentOneYearLater = (calculatorRentYear + 1).toString()
    setChooseFiguresToCalculateRent({
      startValue: startValue.value,
      startMonth: calculateRentStartMonth,
      startYear: calculatorRentYear,
      oneYearLater: {
        phraseOneYearLater: `${getMonthLabel(calculateRentStartMonth)} ${calculatorRentOneYearLater}`,
        endYear: calculatorRentOneYearLater,
      },
      newestNumbersPhrase:
        getMonthLabel(validMaxMonth) + ' ' + validMaxYear + ' (' + props.phrases.husleieLatestFigures + ' )',
    })
    setShowResult(true)
    setChoosePeriod(false)

    if (!isFormValid()) {
      onBlur('start-value')
      onBlur('start-month')
      onBlur('start-year')
      return
    }

    setErrorMessage(null)
    setLoading(true)
  }

  function isFormValid() {
    return isStartValueValid() && isStartYearValid() && isStartMonthValid() && isRentPeriodValid()
  }

  function getServiceData(startValue, startMonth, startYear, endMonth, endYear) {
    axios
      .get(props.kpiServiceUrl, {
        params: {
          startValue,
          startMonth,
          startYear,
          endMonth,
          endYear,
          language: language,
        },
      })
      .then((res) => {
        const changeVal = (res.data.change * 100).toFixed(1)
        const endVal = res.data.endValue.toFixed(2)
        const phraseTo = language === 'en' ? 'to' : 'til'
        const phraseResultText = `${props.phrases.husleieAppliesFor} ${getMonthLabel(
          startMonth
        ).toLowerCase()} ${startYear} ${phraseTo} ${getMonthLabel(endMonth).toLowerCase()} ${endYear}`
        setResultText(phraseResultText)
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
      .finally(() => {
        setLoading(false)
      })
  }

  function submitOneYearLater() {
    setLoading(true)
    getServiceData(
      chooseFiguresToCalculateRent.startValue,
      chooseFiguresToCalculateRent.startMonth,
      chooseFiguresToCalculateRent.startYear,
      chooseFiguresToCalculateRent.startMonth,
      chooseFiguresToCalculateRent.oneYearLater.endYear
    )
  }

  function submitLastPeriod() {
    setLoading(true)
    getServiceData(
      chooseFiguresToCalculateRent.startValue,
      chooseFiguresToCalculateRent.startMonth,
      chooseFiguresToCalculateRent.startYear,
      validMaxMonth,
      validMaxYear
    )
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
    const startMonthEmpty = startMonthValue === ''
    const startMonthValid = !(startYear.value === validMaxYear && startMonthValue > validMaxMonth)
    return !startMonthEmpty || startMonthValid
  }

  function isRentPeriodValid() {
    const startDate = new Date(startYear.value, Number(startMonth.value) - 1, 1)
    const lastPublishDate = new Date(validMaxYear, Number(validMaxMonth) - 1, 1)
    const today = new Date()
    const monthsSinceLastPublished = diffMonths(startDate, lastPublishDate)
    const monthsSinceLastAdjusted = diffMonths(startDate, today)
    const nextAdjust = getNextPeriod(startMonth.value, Number(startYear.value) + 1)
    const rentDate = getMonthLabel(startMonth.value)
    const rentDatePublish = getMonthLabel(nextAdjust.month)

    const warningFiguresNextMonth =
      language === 'en'
        ? `Figures for ${rentDate.toLowerCase()} will be available about 10th of ${rentDatePublish.toLowerCase()}`
        : `Tall for ${rentDate.toLowerCase()} kommer ca 10. ${rentDatePublish.toLowerCase()}`

    const warningLessThanAYear =
      language === 'en'
        ? `According to The Tenancy Act, you can at the earliest adjust rent in ${rentDate.toLowerCase()} ${
            Number(startYear.value) + 1
          }.
       Figures for ${rentDate.toLowerCase()} ${Number(startYear.value) + 1} will be available about the 10th
       of ${rentDatePublish.toLowerCase()} ${nextAdjust.year}`
        : `I følge Husleieloven kan du tidligst endre husleie i ${rentDate.toLowerCase()} ${
            Number(startYear.value) + 1
          }.
      Tall for ${rentDate.toLowerCase()} ${
            Number(startYear.value) + 1
          } kommer ca 10. ${rentDatePublish.toLowerCase()} ${nextAdjust.year}`

    if (monthsSinceLastAdjusted >= 12 && monthsSinceLastPublished === 11) {
      setAdjustRentWarning({
        ...adjustRentWarning,
        warning: true,
        warningTitle: warningFiguresNextMonth,
        warningMsg: '',
      })
    }

    if (monthsSinceLastPublished < 11) {
      setAdjustRentWarning({
        ...adjustRentWarning,
        warning: true,
        warningTitle: props.phrases.husleieUnder12MonthTitle,
        warningMsg: warningLessThanAYear,
      })
    }

    if (monthsSinceLastPublished > 12) {
      setChoosePeriod(true)
    }

    return monthsSinceLastPublished === 12
  }

  function handleStartMonthDropdownErrors() {
    const startMonthValue = startMonth.value
    if (startMonthValue === '') {
      setStartMonth({
        ...startMonth,
        error: true,
      })
      setAdjustRentWarning(defaultAdjustRentWarning)
    }
    const startMonthValid = !(startYear.value === validMaxYear && startMonthValue > validMaxMonth)
    if (!startMonthValid) {
      setStartMonth({
        ...startMonth,
        error: true,
        errorMsg: props.lastNumberText,
      })
      setAdjustRentWarning(defaultAdjustRentWarning)
    }
  }

  function onBlur(id) {
    switch (id) {
      case 'start-value': {
        setStartValue({
          ...startValue,
          error: !isStartValueValid(),
        })
        break
      }
      case 'start-month': {
        handleStartMonthDropdownErrors()
        break
      }
      case 'start-year': {
        setStartYear({
          ...startYear,
          error: !isStartYearValid(),
        })
        break
      }
      default: {
        break
      }
    }
  }

  function onChange(id, value) {
    setShowResult(false)
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
          value: value.id,
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
      default: {
        break
      }
    }
  }

  function diffMonths(fromDate, toDate) {
    return toDate.getMonth() + 12 * toDate.getFullYear() - (fromDate.getMonth() + 12 * fromDate.getFullYear())
  }

  function getMonthLabel(month) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title : ''
  }

  function getNextPeriod(month, year) {
    let nextPeriodMonth = parseInt(month) + 1
    let nextPeriodYear = parseInt(year)

    if (parseInt(month) === 12) {
      nextPeriodMonth = 1
      nextPeriodYear = nextPeriodYear + 1
    }

    return {
      month: nextPeriodMonth,
      year: nextPeriodYear,
    }
  }

  function renderNumberValute(value) {
    if (endValue && change) {
      const valute = language === 'en' ? 'NOK' : 'kr'
      const decimalSeparator = language === 'en' ? '.' : ','
      return (
        <React.Fragment>
          <NumberFormat
            value={Number(value)}
            displayType={'text'}
            thousandSeparator={' '}
            decimalSeparator={decimalSeparator}
            decimalScale={2}
            fixedDecimalScale={true}
            suffix={' ' + valute}
          />
        </React.Fragment>
      )
    }
  }

  function renderNumberChangeValue() {
    if (endValue && change) {
      const changeValue = change.charAt(0) === '-' ? change.replace('-', '') : change
      const decimalSeparator = language === 'en' ? '.' : ','
      return (
        <React.Fragment>
          <NumberFormat
            value={Number(changeValue)}
            displayType={'text'}
            thousandSeparator={' '}
            decimalSeparator={decimalSeparator}
            decimalScale={1}
            fixedDecimalScale={true}
            suffix={' %'}
          />
        </React.Fragment>
      )
    }
  }

  function calculatorResult() {
    return (
      <Container className='calculator-result' ref={scrollAnchor}>
        <Row className='mb-3 mb-sm-5'>
          <Col className='amount-equal align-self-end col-12 col-md-4'>
            <Title size={3}>{props.phrases.husleieNewRent}</Title>
          </Col>
          <Col className='end-value col-12 col-md-8'>
            <span className='float-start float-md-end'>{renderNumberValute(endValue)}</span>
          </Col>
          <Col className='col-12'>
            <Divider dark />
          </Col>
        </Row>
        <Row>
          <Col className='price-change col-12 col-md-5 col-lg-4'>
            <span>{props.phrases.calculatorChange}</span>
            <span className='float-end'>{renderNumberChangeValue()}</span>
            <Divider dark />
          </Col>
          <Col className='price-change-text col-12 col-md-7 col-lg-6'>
            <span>{resultText}</span>
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
                errorMessages={[errorMessage || props.phrases.kpiErrorUnknownError]}
                title={props.phrases.kpiErrorCalculationFailed}
              />
            </Col>
          </Row>
        </Container>
      )
    }
    if (endValue && change && showResult) {
      return calculatorResult()
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

  function renderChooseHusleiePeriode() {
    if (choosePeriod && showResult) {
      return (
        <Container ref={scrollAnchor}>
          <Divider className='my-5' />
          <Row>
            <Title size={3} className='col-12 mb-2'>
              {props.phrases.husleieValidateOver1Year}
            </Title>
            <p className='col-12 mb-4'>{props.phrases.husleieChooseFiguresToCalculateRent}</p>
          </Row>
          <Row className='ms-0'>
            <Button className='submit-one-year' onClick={submitOneYearLater} ref={submitButton}>
              {chooseFiguresToCalculateRent.oneYearLater.phraseOneYearLater}
            </Button>
            <Button className='submit-last-period' onClick={submitLastPeriod} ref={submitButton}>
              {chooseFiguresToCalculateRent.newestNumbersPhrase}
            </Button>
          </Row>
        </Container>
      )
    }
  }

  function renderAlertUnderAYearAgo() {
    if (adjustRentWarning.warning) {
      return (
        <Col className='col-12 col-md-9 pl-0 mt-4'>
          <Dialog type='info' title={adjustRentWarning.warningTitle}>
            {adjustRentWarning.warningMsg}
          </Dialog>
        </Col>
      )
    }
  }

  function renderCalculator() {
    return (
      <Container className='husleie-calculator'>
        {renderForm()}
        <div aria-live='polite' aria-atomic='true'>
          {renderResult()}
        </div>
      </Container>
    )
  }

  function renderForm() {
    return (
      <div className='calculator-form'>
        <Row>
          <Col className='col-12 col-md-6'>
            <Title size={2}>{props.phrases.husleieTitle}</Title>
          </Col>
          {renderLinkArticle()}
        </Row>
        <Row>
          <Col className='col-12 col-md-9'>
            <p className='publish-text'>{props.nextPublishText}</p>
          </Col>
        </Row>
        <div aria-live='polite'>{renderAlertUnderAYearAgo()}</div>
        <Form onSubmit={onSubmit}>
          <Container>
            <Row>
              <Col className='input-amount'>
                <Title size={3}>{props.phrases.husleieRentToday}</Title>
                <Input
                  className='start-value'
                  label={props.phrases.enterAmount}
                  handleChange={(value) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                />
              </Col>
            </Row>
            <Row>
              <Col className='calculate-from col-12 col-lg-6'>
                <Title size={3}>{props.phrases.husleieLastAdjust}</Title>
                <Container>
                  <Row>
                    <Col className='select-month col-12 col-sm-8'>
                      <Dropdown
                        className='month'
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
                    <Col className='select-year col-sm-4'>
                      <Input
                        className='input-year'
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
            <Row className='submit'>
              <Col>
                <Button className='submit-button' primary type='submit' disabled={loading} ref={submitButton}>
                  {props.phrases.husleieSubmit}
                </Button>
              </Col>
            </Row>
            <div aria-live='polite'>{renderChooseHusleiePeriode()}</div>
          </Container>
        </Form>
      </div>
    )
  }

  return renderCalculator()
}

HusleieCalculator.defaultValue = {
  kpiServiceUrl: null,
  language: 'nb',
}

HusleieCalculator.propTypes = {
  kpiServiceUrl: PropTypes.string,
  language: PropTypes.string,
  months: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  phrases: PropTypes.object,
  calculatorArticleUrl: PropTypes.string,
  nextPublishText: PropTypes.string,
  lastNumberText: PropTypes.string,
  lastUpdated: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.string,
  }),
}

export default (props) => <HusleieCalculator {...props} />
