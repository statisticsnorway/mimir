import React, { useState, useRef, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, FormError, Link, RadioGroup } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'

function PifCalculator(props) {
  const validMaxYear = props.lastUpdated.year
  const { pifErrorProduct, calculatorValidateAmountNumber, pifValidateYear } = props.phrases
  const [scopeCode, setScopeCode] = useState({
    error: false,
    errorMsg: '',
    value: '',
  })
  const [reset, setReset] = useState(0)
  const [productGroup, setProductGroup] = useState({
    error: false,
    errorMsg: pifErrorProduct,
    value: '',
  })
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: calculatorValidateAmountNumber,
    value: '',
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: '90',
  })
  const validMinYear = getStartYearRelevantDataset()
  const validMinYearPhrase = pifValidateYear.replaceAll('{0}', validMinYear)
  const validYearErrorMsg = `${validMinYearPhrase} ${validMaxYear}`
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: validYearErrorMsg,
    value: '',
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: '90',
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: validYearErrorMsg,
    value: '',
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState(null)
  const [change, setChange] = useState(null)
  const [startPeriod, setStartPeriod] = useState(null)
  const [endPeriod, setEndPeriod] = useState(null)
  const [startValueResult, setStartValueResult] = useState(null)
  const [startIndex, setStartIndex] = useState(null)
  const [endIndex, setEndIndex] = useState(null)
  const language = props.language ? props.language : 'nb'
  const scrollAnchor = useRef(null)
  const onSubmitBtnElement = useRef(null)

  const validMaxMonth = props.lastUpdated.month
  const yearRegexp = /^[1-9]\d{3}$/g

  useEffect(() => {
    if (!loading && scrollAnchor.current) {
      scrollAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [loading])

  useEffect(() => {
    setStartYear({
      ...startYear,
      errorMsg: validYearErrorMsg,
    })
    setEndYear({
      ...endYear,
      errorMsg: validYearErrorMsg,
    })
  }, [validMinYear])

  function closeResult() {
    setEndValue(null)
    if (onSubmitBtnElement.current) onSubmitBtnElement.current.focus()
  }

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
    axios
      .get(props.pifServiceUrl, {
        params: {
          scopeCode: scopeCode.value,
          productGroup: productGroup.value,
          startValue: startValue.value,
          startYear: startYear.value,
          startMonth: startMonth.value,
          endYear: endYear.value,
          endMonth: endMonth.value,
          language: language,
        },
      })
      .then((res) => {
        const changeVal = (res.data.change * 100).toFixed(1)
        const endVal = res.data.endValue.toFixed(2)
        const startPeriod = getPeriod(startYear.value, startMonth.value)
        const endPeriod = getPeriod(endYear.value, endMonth.value)
        setChange(changeVal)
        setEndValue(endVal)
        setStartPeriod(startPeriod)
        setEndPeriod(endPeriod)
        setStartValueResult(startValue.value)
        setStartIndex(res.data.startIndex)
        setEndIndex(res.data.endIndex)
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

  function getStartYearRelevantDataset() {
    // Datasets available from 1977 for home market
    if (scopeCode.value === '2') return 1977
    // Datasets available from 1953 for home and import market with spesific product type
    if (scopeCode.value === '3' && productGroup.value && productGroup.value !== 'SITCT') return 1953
    // Datasets available from 1926 for home and import market and product type 'all'
    return 1926
  }

  function isFormValid() {
    return isStartValueValid() && isStartYearValid() && isStartMonthValid() && isEndYearValid() && isEndMonthValid()
  }

  function isStartValueValid(value) {
    const startVal = value || startValue.value
    const testStartValue = startVal.match(/^-?\d+(?:[.,]\d*)?$/g)
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

  function isStartMonthValid(value) {
    const startMonthValue = value || startMonth.value
    const startMonthValid = !(
      startYear.value === validMaxYear &&
      (startMonthValue === '' || startMonthValue > validMaxMonth)
    )
    if (!startMonthValid) {
      setStartMonth({
        ...startMonth,
        error: true,
      })
    }
    return startMonthValid
  }

  function isEndMonthValid(value) {
    const endMonthValue = value || endMonth.value
    const maxYearAverage = Number(validMaxMonth) === 12 ? validMaxYear : Number(validMaxYear) - 1
    const endMonthValid =
      endMonthValue === ''
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

  function onBlur(id) {
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

  function onChange(id, value) {
    switch (id) {
      case 'scope-code': {
        setScopeCode({
          ...scopeCode,
          value: value,
        })
        // Missing data for pifProductOil (SITC4) and home market (2)
        if (value === '2' && productGroup.value === 'SITC4') {
          setReset(reset + 1)
          setProductGroup({ ...productGroup, value: 'SITCT' })
        }
        break
      }
      case 'product-group': {
        setProductGroup({
          ...productGroup,
          value: value.id,
        })
        break
      }
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
      case 'end-month': {
        setEndMonth({
          ...endMonth,
          value: value.id,
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

  function addDropdownMonth(id) {
    return (
      <Dropdown
        className='month'
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value) => {
          onChange(id, value)
        }}
        error={startMonth.error}
        errorMessage={startMonth.errorMsg}
        selectedItem={{
          title: props.phrases.calculatorMonthAverage,
          id: '',
        }}
        items={props.months}
      />
    )
  }

  function addDropdownEndMonth(id) {
    return (
      <Dropdown
        className='month'
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value) => {
          onChange(id, value)
        }}
        error={endMonth.error}
        errorMessage={endMonth.errorMsg}
        selectedItem={{
          title: props.phrases.calculatorMonthAverage,
          id: '',
        }}
        items={props.months}
      />
    )
  }

  function addDropdownProduct(id) {
    const productGroupAll = props.phrases.pifProductTypeAll

    return (
      <Dropdown
        className='productGroup'
        id={id}
        key={`productGroup-${reset}`}
        onSelect={(value) => {
          onChange(id, value)
        }}
        selectedItem={{
          title: productGroupAll,
          id: 'SITCT',
        }}
        // Dataset not available for pifProductOil (SITC4) for home market (2)
        items={scopeCode.value === '2' ? props.productGroups.toSpliced(5, 1) : props.productGroups}
        ariaLabel={props.phrases.pifProductTypeHeader}
      />
    )
  }

  function getPeriod(year, month) {
    return month === '' ? year : `${getMonthLabel(month)} ${year}`
  }

  function getMonthLabel(month) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title.toLowerCase() : ''
  }

  function renderNumberValute(value) {
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

  function renderNumberChangeValue() {
    if (endValue && change) {
      const changeValue = change.charAt(0) === '-' ? change.replace('-', '') : change
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

  function renderNumber(value) {
    if (endValue && change) {
      const decimalSeparator = language === 'en' ? '.' : ','
      return (
        <React.Fragment>
          <NumericFormat
            value={Number(value)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={1}
            fixedDecimalScale
          />
        </React.Fragment>
      )
    }
  }

  function calculatorResult() {
    const priceChangeLabel = change.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
    return (
      <Container className='calculator-result' ref={scrollAnchor} tabIndex='0'>
        <Row className='mb-5'>
          <Col className='amount-equal col-12 col-md-4'>
            <h3>{props.phrases.pifAmountEqualled}</h3>
          </Col>
          <Col className='end-value col-12 col-md-8'>
            <span className='float-start float-md-end'>{renderNumberValute(endValue)}</span>
          </Col>
          <Col className='col-12'>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5'>
          <Col className='price-increase col-12 col-lg-4'>
            <span>{priceChangeLabel}</span>
            <span className='float-end'>{renderNumberChangeValue()}</span>
            <Divider dark />
          </Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {props.phrases.amount} {startPeriod}
            </span>
            <span className='float-end'>{renderNumberValute(startValueResult)}</span>
            <Divider dark />
          </Col>
          <Col className='amount col-12 col-lg-4'>
            <span>
              {props.phrases.amount} {endPeriod}
            </span>
            <span className='float-end'>{renderNumberValute(endValue)}</span>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5'>
          <Col className='price-increase col-12 col-lg-4'></Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {props.phrases.pifIndex} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startIndex)}</span>
            <Divider dark />
          </Col>
          <Col className='amount col-12 col-lg-4'>
            <span>
              {props.phrases.pifIndex} {endPeriod}
            </span>
            <span className='float-end'>{renderNumber(endIndex)}</span>
            <Divider dark />
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
                errorMessages={[errorMessage || props.phrases.pifErrorUnknownError]}
                title={props.phrases.pifErrorCalculationFailed}
              />
            </Col>
          </Row>
        </Container>
      )
    }
    if (endValue && change) {
      return calculatorResult()
    }
  }

  function renderLinkArticle() {
    if (props.calculatorArticleUrl) {
      return (
        <Col className='article-link align-self-center col-12 col-md-6'>
          <Link className='float-md-end' href={props.calculatorArticleUrl} standAlone>
            {props.phrases.readAboutCalculator}
          </Link>
        </Col>
      )
    }
  }

  function renderForm() {
    return (
      <div className='calculator-form'>
        <Row>
          <Col>
            <h2>{props.phrases.pifTitle}</h2>
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
              <Col className='choose-scope'>
                <RadioGroup
                  header={props.phrases.pifChooseHeader}
                  onChange={(value) => {
                    onChange('scope-code', value)
                  }}
                  selectedValue='3'
                  orientation='column'
                  items={[
                    {
                      id: 'pif-choose-home-import',
                      label: props.phrases.pifChooseHomeImport,
                      value: '3',
                    },
                    {
                      id: 'pif-choose-home',
                      label: props.phrases.pifChooseHome,
                      value: '2',
                    },
                  ]}
                />
              </Col>
            </Row>
            <Row>
              <Col className='select-product-group'>
                <h3>{props.phrases.pifProductTypeHeader}</h3>
                {addDropdownProduct('product-group')}
              </Col>
            </Row>
            <Row>
              <Col className='input-amount'>
                <h3 id='product-price'>{props.phrases.pifProductPriceHeader}</h3>
                <Input
                  className='start-value'
                  handleChange={(value) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                  ariaLabelledBy='product-price'
                />
              </Col>
            </Row>
            <Row>
              <Col className='calculate-from col-12 col-lg-6'>
                <h3>{props.phrases.calculatePriceChangeFrom}</h3>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={props.phrases.fromYear}
                        ariaLabel={props.phrases.fromYearScreenReader}
                        handleChange={(value) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                    <Col className='select-month col-12 col-sm-7'>{addDropdownMonth('start-month')}</Col>
                  </Row>
                </Container>
              </Col>
              <Col className='calculate-to col-12 col-lg-6'>
                <h3>{props.phrases.calculatePriceChangeTo}</h3>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={props.phrases.toYear}
                        ariaLabel={props.phrases.toYearScreenReader}
                        handleChange={(value) => onChange('end-year', value)}
                        error={endYear.error}
                        errorMessage={endYear.errorMsg}
                        onBlur={() => onBlur('end-year')}
                      />
                    </Col>
                    <Col className='select-month col-12 col-sm-7'>{addDropdownEndMonth('end-month')}</Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className='submit'>
              <Col>
                <Button ref={onSubmitBtnElement} className='submit-button' primary type='submit' disabled={loading}>
                  {props.phrases.seePriceChange}
                </Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    )
  }

  return (
    <Container className='pif-calculator'>
      {renderForm()}
      <div aria-live='polite' aria-atomic='true'>
        {renderResult()}
      </div>
    </Container>
  )
}

PifCalculator.defaultValue = {
  pifServiceUrl: null,
  language: 'nb',
}

PifCalculator.propTypes = {
  pifServiceUrl: PropTypes.string,
  language: PropTypes.string,
  months: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  productGroups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
    })
  ),
  phrases: PropTypes.arrayOf(PropTypes.string),
  nextPublishText: PropTypes.string,
  lastNumberText: PropTypes.string,
  lastUpdated: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.string,
  }),
  calculatorArticleUrl: PropTypes.string,
}

export default (props) => <PifCalculator {...props} />
