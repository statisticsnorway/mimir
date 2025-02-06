import React, { useState, useRef, useEffect } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'
import {
  Input,
  Button,
  Dropdown,
  Divider,
  FormError,
  Link,
  RadioGroup,
  Title,
} from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'
import { BkibolCalculatorProps } from '/lib/types/partTypes/bkibolCalculator'

function BkibolCalculator(props: BkibolCalculatorProps) {
  const validMaxYear = props.lastUpdated.year
  const defaultSerieValue = {
    title: props.phrases.bkibolChooseWork,
    id: '',
  }
  const defaultMonthValue = {
    title: props.phrases.chooseMonth,
    id: '',
  }
  const defaultMonthErrorMsg = props.phrases.calculatorValidateDropdownMonth
  const [scope, setScope] = useState({
    error: false,
    errorMsg: 'Feil markedskode',
    value: '',
  })
  const [domene, setDomene] = useState({
    error: false,
    errorMsg: 'Feil domene',
    value: 'ENEBOLIG',
  })
  const [serie, setSerie] = useState({
    error: false,
    errorMsg: props.phrases.bkibolValidateSerie,
    value: defaultSerieValue,
  })
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateAmountNumber,
    value: '',
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: defaultMonthErrorMsg,
    value: defaultMonthValue,
  })
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: `${props.phrases.bkibolValidateYear} ${validMaxYear}`,
    value: '',
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: defaultMonthErrorMsg,
    value: defaultMonthValue,
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: `${props.phrases.bkibolValidateYear} ${validMaxYear}`,
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

  const validMaxMonth = props.lastUpdated.month
  const validMinYear = 1979
  const yearRegexp = /^[1-9]\d{3}$/g

  const scrollAnchor = useRef<null | HTMLDivElement>(null)
  useEffect(() => {
    if (!loading && scrollAnchor.current !== null) {
      scrollAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [loading])

  function serieItemsDomene(domene: string) {
    return [
      {
        id: 'ALT',
        title: props.phrases.bkibolWorkTypeAll,
      },
      {
        id: 'STEIN',
        title: props.phrases.bkibolWorkTypeStone,
        disabled: domene === 'BOLIGBLOKK',
      },
      {
        id: 'GRUNNARBEID',
        title: props.phrases.bkibolWorkTypeGroundwork,
      },
      {
        id: 'BYGGEARBEIDER',
        title: props.phrases.bkibolWorkTypeWithoutStone,
        disabled: domene === 'BOLIGBLOKK',
      },
      {
        id: 'TOMRING',
        title: props.phrases.bkibolWorkTypeCarpentry,
      },
      {
        id: 'MALING',
        title: props.phrases.bkibolWorkTypePainting,
      },
      {
        id: 'RORLEGGERARBEID',
        title: props.phrases.bkibolWorkTypePlumbing,
      },
      {
        id: 'ELEKTRIKERARBEID',
        title: props.phrases.bkibolWorkTypeElectric,
      },
    ]
  }

  const submitButton = useRef<null | HTMLButtonElement>(null)
  function closeResult() {
    if (submitButton.current) submitButton.current.focus()
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
      onBlur('start-month')
      onBlur('end-month')
      return
    }

    setErrorMessage(null)
    setLoading(true)
    axios
      .get(props.bkibolServiceUrl, {
        params: {
          scope: scope.value,
          domene: domene.value,
          serie: serie.value.id,
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

  function isFormValid() {
    return (
      isSerieValid() &&
      isStartValueValid() &&
      isStartYearValid() &&
      isStartMonthValid() &&
      isEndYearValid() &&
      isEndMonthValid()
    )
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

  function isSerieValid(value?: string) {
    const serieValue = value || serie.value.id
    const serieValid = serieValue !== ''
    if (!serieValid) {
      setSerie({
        ...serie,
        error: true,
      })
    }
    return serieValid
  }

  function isStartMonthValid(value?: string) {
    const startMonthValue = value ?? startMonth.value.id
    const startMonthValid = !(startYear.value === validMaxYear && startMonthValue > validMaxMonth)
    return startMonthValue === '' ? false : startMonthValid
  }

  function isEndMonthValid(value?: string) {
    const endMonthValue = value ?? endMonth.value.id
    const endMonthValid = !(endYear.value === validMaxYear && endMonthValue > validMaxMonth)
    return endMonthValue === '' ? false : endMonthValid
  }

  function onBlur(id: string) {
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
      case 'start-month': {
        setStartMonth({
          ...startMonth,
          error: !isStartMonthValid(),
        })
        break
      }
      case 'end-month': {
        setEndMonth({
          ...endMonth,
          error: !isEndMonthValid(),
        })
        break
      }
      default: {
        break
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onChange(id: string, value: any) {
    switch (id) {
      case 'scope': {
        setScope({
          ...scope,
          value: value,
        })
        break
      }
      case 'domene': {
        setDomene({
          ...domene,
          value: value,
        })
        setSerie({
          error: false,
          errorMsg: props.phrases.bkibolValidateSerie,
          value: defaultSerieValue,
        })
        break
      }
      case 'serie': {
        setSerie({
          ...serie,
          value,
          error: serie.error ? !isSerieValid(value.id) : serie.error,
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
          errorMsg: value.id !== '' ? props.lastNumberText : defaultMonthErrorMsg,
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
          errorMsg: value.id !== '' ? props.lastNumberText : defaultMonthErrorMsg,
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

  function addDropdownStartMonth(id: string) {
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

  function addDropdownEndMonth(id: string) {
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

  function addDropdownSerieEnebolig() {
    if (domene.value === 'ENEBOLIG') {
      return (
        <Dropdown
          className='serie-enebolig'
          id='serie'
          onSelect={(value: object) => {
            onChange('serie', value)
          }}
          error={serie.error}
          errorMessage={serie.errorMsg}
          selectedItem={serie.value}
          items={serieItemsDomene('ENEBOLIG')}
          ariaLabel={props.phrases.bkibolWorkTypeDone}
        />
      )
    }
  }

  function addDropdownSerieBoligblokk() {
    if (domene.value === 'BOLIGBLOKK') {
      return (
        <Dropdown
          className='serie-boligblokk'
          id='serie'
          onSelect={(value: object) => {
            onChange('serie', value)
          }}
          error={serie.error}
          errorMessage={serie.errorMsg}
          selectedItem={serie.value}
          items={serieItemsDomene('BOLIGBLOKK')}
          ariaLabel={props.phrases.bkibolWorkTypeDone}
        />
      )
    }
  }

  function getPeriod(year: string, month: string) {
    return month === '' ? year : `${getMonthLabel(month)} ${year}`
  }

  function getMonthLabel(month: string) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title.toLowerCase() : ''
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

  function renderNumberChangeValue(changeValue: string) {
    if (endValue && changeValue) {
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
    const changeValue = change?.charAt(0) === '-' ? change?.replaceAll('-', '') : (change ?? '')
    const endValueText = endValue?.toString() ?? ''
    const startIndexText = startIndex?.toString() ?? ''
    const endIndexText = endIndex?.toString() ?? ''
    const resultScreenReaderText = props.phrases.calculatorResultScreenReader
      .replaceAll('{0}', language === 'en' ? endValueText : endValueText.replaceAll('.', ','))
      .replaceAll('{1}', priceChangeLabel)
      .replaceAll('{2}', language === 'en' ? changeValue : changeValue.replaceAll('.', ','))
      .replaceAll('{3}', startPeriod as string)
      .replaceAll('{4}', endPeriod as string)
      .replaceAll('{5}', language === 'en' ? startIndexText : startIndexText.replaceAll('.', ','))
      .replaceAll('{6}', language === 'en' ? endIndexText : endIndexText.replaceAll('.', ','))

    return (
      <Container className='calculator-result' ref={scrollAnchor}>
        <div aria-atomic='true'>
          <span className='sr-only'>{resultScreenReaderText}</span>
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
        <Row className='mb-0 mb-lg-5' aria-hidden='true'>
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
        <Row aria-hidden='true'>
          <Col className='start-value col-12 col-lg-4 offset-lg-4'>
            <span>
              {props.phrases.index} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startIndex!)}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {props.phrases.index} {endPeriod}
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
                errorMessages={[errorMessage || props.phrases.calculatorUknownError]}
                title={props.phrases.calculatorErrorCalculationFailed}
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
            <Title size={2}>{props.phrases.bkibolTitle}</Title>
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
            <Row className='my-5'>
              <Col className='col-12 col-md-6 col-xl-4 mb-3 mb-md-0'>
                <Title size={3}>{props.phrases.bkibolChooseDwellingType}</Title>
                <RadioGroup
                  groupName='dwellingType'
                  onChange={(value: string) => {
                    onChange('domene', value)
                  }}
                  selectedValue='ENEBOLIG'
                  orientation='column'
                  items={[
                    {
                      label: props.phrases.bkibolDetachedHouse,
                      value: 'ENEBOLIG',
                    },
                    {
                      label: props.phrases.bkibolMultiDwellingHouse,
                      value: 'BOLIGBLOKK',
                    },
                  ]}
                />
              </Col>
              <Col className='select-serie col-12 col-md-6 col-xl-6'>
                <Title size={3}>{props.phrases.bkibolWorkTypeDone}</Title>
                {addDropdownSerieEnebolig()}
                {addDropdownSerieBoligblokk()}
              </Col>
            </Row>
            <Divider />
            <Row className='my-5'>
              <Col className='choose-scope col-12 col-md-6 col-xl-4 mb-3 mb-md-0'>
                <Title size={3}>{props.phrases.bkibolAmountInclude}</Title>
                <RadioGroup
                  groupName='amountInclude'
                  onChange={(value: string) => {
                    onChange('scope', value)
                  }}
                  selectedValue='ALT'
                  orientation='column'
                  items={[
                    {
                      label: props.phrases.bkibolExpenditureAll,
                      value: 'ALT',
                    },
                    {
                      label: props.phrases.bkibolExpenditureMatrials,
                      value: 'MATERIALER',
                    },
                  ]}
                />
              </Col>
              <Col className='input-amount col-12 col-md-6 col-xl-8'>
                <h3 id='amount'>{props.phrases.bkibolAmount}</h3>
                <Input
                  className='start-value'
                  handleChange={(value: string) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                  ariaLabelledBy='amount'
                />
              </Col>
            </Row>
            <Divider />
            <Row className='mt-5'>
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
                    <Col className='select-period col-12 col-sm-7'>{addDropdownStartMonth('start-month')}</Col>
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
                    <Col className='select-period col-12 col-sm-7'>{addDropdownEndMonth('end-month')}</Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className='submit'>
              <Col>
                <Button className='submit-button' ref={submitButton} primary type='submit' disabled={loading}>
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
    <section className='bkibol-calculator'>
      <Container className='content'>
        {renderForm()}
        <div aria-live='polite'>{renderResult()}</div>
      </Container>
    </section>
  )
}

BkibolCalculator.defaultValue = {
  bkibolServiceUrl: null,
  language: 'nb',
}

export default (props: BkibolCalculatorProps) => <BkibolCalculator {...props} />
