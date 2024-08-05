import React, { useState, useRef, useEffect } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, FormError, Link, RadioGroup } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'
import { PifCalculatorProps } from '../../lib/types/partTypes/pifCalculaor'

function PifCalculator(props: PifCalculatorProps) {
  const validMaxYear = props.lastUpdated.year
  const DEFAULT_PRODUCT_GROUP_TYPE = {
    title: props.phrases.pifProductTypeAll,
    id: 'SITCT',
  }
  const { calculatorValidateAmountNumber, pifValidateYear } = props.phrases
  const [scopeCode, setScopeCode] = useState({
    error: false,
    errorMsg: '',
    value: '',
  })
  const [reset, setReset] = useState(0)
  const [productGroup, setProductGroup] = useState({
    error: false,
    errorMsg: '',
    value: DEFAULT_PRODUCT_GROUP_TYPE,
  })
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: calculatorValidateAmountNumber,
    value: '',
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.lastNumberText,
    value: {
      title: props.phrases.calculatorMonthAverage,
      id: '90',
    },
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
    value: {
      title: props.phrases.calculatorMonthAverage,
      id: '90',
    },
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: validYearErrorMsg,
    value: '',
  })
  const [errorMessage, setErrorMessage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [endValue, setEndValue] = useState<null | number>(null)
  const [change, setChange] = useState<null | string>(null)
  const [startPeriod, setStartPeriod] = useState<null | string>(null)
  const [endPeriod, setEndPeriod] = useState<null | string>(null)
  const [startValueResult, setStartValueResult] = useState<null | string>(null)
  const [startIndex, setStartIndex] = useState<null | number>(null)
  const [endIndex, setEndIndex] = useState<null | number>(null)
  const language = props.language ? props.language : 'nb'
  const scrollAnchor = useRef<null | HTMLDivElement>(null)
  const onSubmitBtnElement = useRef<null | HTMLButtonElement>(null)

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
      .get(props.pifServiceUrl, {
        params: {
          scopeCode: scopeCode.value,
          productGroup: productGroup.value.id,
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
        setStartIndex(res.data.startIndex.toFixed(1))
        setEndIndex(res.data.endIndex.toFixed(1))
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
    if (scopeCode.value === '3' && productGroup.value && productGroup.value.id !== 'SITCT') return 1953
    // Datasets available from 1926 for home and import market and product type 'all'
    return 1926
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
    return !(!isStartYearValid || isNaN(intStartYear) || intStartYear < validMinYear || intStartYear > validMaxYear)
  }

  function isEndYearValid(value?: string) {
    const endYearValue = value || endYear.value
    const testEndYear = endYearValue.match(yearRegexp)
    const isEndYearValid = testEndYear && testEndYear.length === 1
    const intEndYear = parseInt(endYearValue)
    return !(!isEndYearValid || isNaN(intEndYear) || intEndYear < validMinYear || intEndYear > validMaxYear)
  }

  function isStartMonthValid(value?: string) {
    const startMonthValue = value || startMonth.value.id
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

  function isEndMonthValid(value?: string) {
    const endMonthValue = value || endMonth.value.id
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
      case 'scope-code': {
        setScopeCode({
          ...scopeCode,
          value: value,
        })
        // Missing data for pifProductOil (SITC4) and home market (2)
        if (value === '2' && productGroup.value.id === 'SITC4') {
          setReset(reset + 1)
          setProductGroup({ ...productGroup, value: DEFAULT_PRODUCT_GROUP_TYPE })
        }
        break
      }
      case 'product-group': {
        setProductGroup({
          ...productGroup,
          value,
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
        className='month'
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
        className='month'
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

  function addDropdownProduct(id: string | number) {
    return (
      <Dropdown
        id={id}
        key={`productGroup-${reset}`}
        onSelect={(value: object) => {
          onChange(id, value)
        }}
        selectedItem={productGroup.value}
        // Dataset not available for pifProductOil (SITC4) for home market (2)
        items={scopeCode.value === '2' ? props.productGroups.toSpliced(5, 1) : props.productGroups}
        ariaLabel={props.phrases.pifProductTypeHeader}
      />
    )
  }

  function getPeriod(year: string, month: string) {
    return month === '' ? year : `${getMonthLabel(month)} ${year}`
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

  function renderNumber(value: string | number) {
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
    const priceChangeLabel = change?.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
    const changeValue = change?.charAt(0) === '-' ? change.replace('-', '') : change
    const pifResultForScreenreader = props.phrases.pifResultForScreenreader
      .replace('{0}', language === 'en' ? endValue : endValue?.replace('.', ','))
      .replace('{1}', priceChangeLabel)
      .replace('{2}', language === 'en' ? changeValue : changeValue?.replace('.', ','))
      .replaceAll('{3}', startMonth.value.id !== '90' ? startPeriod : startYear.value)
      .replaceAll('{4}', endMonth.value.id !== '90' ? endPeriod : endYear.value)
      .replace('{5}', language === 'en' ? startIndex : startIndex?.replace('.', ','))
      .replace('{6}', language === 'en' ? endIndex : endIndex?.replace('.', ','))

    return (
      <Container className='calculator-result' ref={scrollAnchor} tabIndex='0'>
        <div aria-atomic='true'>
          <span className='sr-only'>{pifResultForScreenreader}</span>
        </div>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='amount-equal col-12 col-md-4'>
            <h3>{props.phrases.amountEqualled}</h3>
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
        <Row className='mb-5' aria-hidden='true'>
          <Col className='col-12 col-lg-4'></Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {props.phrases.pifIndex} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startIndex!)}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {props.phrases.pifIndex} {endPeriod}
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
                  onChange={(value: string) => {
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
              <Col>
                <h3>{props.phrases.pifProductTypeHeader}</h3>
                {addDropdownProduct('product-group')}
              </Col>
            </Row>
            <Row>
              <Col className='input-amount'>
                <h3 id='product-price'>{props.phrases.pifProductPriceHeader}</h3>
                <Input
                  className='start-value'
                  handleChange={(value: string) => onChange('start-value', value)}
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
                        handleChange={(value: string) => onChange('start-year', value)}
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
                        handleChange={(value: string) => onChange('end-year', value)}
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
      <div aria-live='polite'>{renderResult()}</div>
    </Container>
  )
}

PifCalculator.defaultValue = {
  pifServiceUrl: null,
  language: 'nb',
}

export default (props: PifCalculatorProps) => <PifCalculator {...props} />
