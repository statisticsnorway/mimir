import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input,
  Button,
  Dropdown,
  Divider,
  FormError,
  Link,
  RadioGroup,
  Title } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import NumberFormat from 'react-number-format'
import { X } from 'react-feather'

function BkibolCalculator(props) {
  const validMaxYear = props.lastUpdated.year
  const [scope, setScope] = useState({
    error: false,
    errorMsg: 'Feil markedskode',
    value: ''
  })
  const [domene, setDomene] = useState({
    error: false,
    errorMsg: 'Feil domene',
    value: 'ENEBOLIG'
  })
  const [serie, setSerie] = useState({
    error: false,
    errorMsg: props.phrases.bkibolValidateSerie,
    value: ''
  })
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateAmountNumber,
    value: ''
  })
  const [startMonth, setStartMonth] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateDropdownMonth,
    value: ''
  })
  const [startYear, setStartYear] = useState({
    error: false,
    errorMsg: `${props.phrases.bkibolValidateYear} ${validMaxYear}`,
    value: ''
  })
  const [endMonth, setEndMonth] = useState({
    error: false,
    errorMsg: props.phrases.calculatorValidateDropdownMonth,
    value: ''
  })
  const [endYear, setEndYear] = useState({
    error: false,
    errorMsg: `${props.phrases.bkibolValidateYear} ${validMaxYear}`,
    value: ''
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

  // const validMaxYear = props.lastUpdated.year
  const validMaxMonth = props.lastUpdated.month
  const validMinYear = 1979
  const yearRegexp = /^[1-9]{1}[0-9]{3}$/g

  const scrollAnchor = React.useRef(null)
  function scrollToResult() {
    scrollAnchor.current.focus({
      preventScroll: true
    })
    scrollAnchor.current.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
      inline: 'nearest'
    })
  }

  function serieItemsDomene(domene) {
    return [
      {
        id: 'ALT',
        title: props.phrases.bkibolWorkTypeAll
      },
      {
        id: 'STEIN',
        title: props.phrases.bkibolWorkTypeStone,
        disabled: domene === 'BOLIGBLOKK'
      },
      {
        id: 'GRUNNARBEID',
        title: props.phrases.bkibolWorkTypeGroundwork
      },
      {
        id: 'BYGGEARBEIDER',
        title: props.phrases.bkibolWorkTypeWithoutStone,
        disabled: domene === 'BOLIGBLOKK'
      },
      {
        id: 'TOMRING',
        title: props.phrases.bkibolWorkTypeCarpentry
      },
      {
        id: 'MALING',
        title: props.phrases.bkibolWorkTypePainting
      },
      {
        id: 'RORLEGGERARBEID',
        title: props.phrases.bkibolWorkTypePlumbing
      },
      {
        id: 'ELEKTRIKERARBEID',
        title: props.phrases.bkibolWorkTypeElectric
      }
    ]
  }

  function closeResult() {
    setEndValue(null)
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
    axios.get(props.bkibolServiceUrl, {
      params: {
        scope: scope.value,
        domene: domene.value,
        serie: serie.value,
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
      .finally(()=> {
        setLoading(false)
        scrollToResult()
      })
  }

  function isFormValid() {
    return isSerieValid() && isStartValueValid() && isStartYearValid() && isStartMonthValid() && isEndYearValid() && isEndMonthValid()
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

  function isSerieValid(value) {
    const serieValue = value || serie.value
    const serieValid = serieValue !== ''
    if (!serieValid) {
      setSerie({
        ...serie,
        error: true
      })
    }
    return serieValid
  }

  function isStartMonthValid(value) {
    const startMonthValue = value || startMonth.value
    const startMonthEmpty = startMonthValue === ''
    if (startMonthEmpty) {
      setStartMonth({
        ...startMonth,
        error: true
      })
    }
    const startMonthValid = !((startYear.value === validMaxYear) && (startMonthValue > validMaxMonth))
    if (!startMonthValid) {
      setStartMonth({
        ...startMonth,
        error: true,
        errorMsg: props.lastNumberText
      })
    }
    return startMonthEmpty ? startMonthEmpty : startMonthValid
  }

  function isEndMonthValid(value) {
    const endMonthValue = value || endMonth.value
    const endMonthEmpty = endMonthValue === ''
    if (endMonthEmpty) {
      setEndMonth({
        ...endMonth,
        error: true
      })
    }
    const endMonthValid = !((endYear.value === validMaxYear) && (endMonthValue > validMaxMonth))
    if (!endMonthValid) {
      setEndMonth({
        ...endMonth,
        error: true,
        errorMsg: props.lastNumberText
      })
    }
    return endMonthEmpty ? endMonthEmpty : endMonthValid
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
    case 'scope': {
      setScope({
        ...scope,
        value: value
      })
      break
    }
    case 'domene': {
      setDomene({
        ...domene,
        value: value
      })
      break
    }
    case 'serie': {
      setSerie({
        ...serie,
        value: value.id,
        error: serie.error ? !isSerieValid(value.id) : serie.error
      })
      break
    }
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
    case 'end-month': {
      setEndMonth({
        ...endMonth,
        value: value.id,
        error: endMonth.error ? !isEndMonthValid(value.id) : endMonth.error
      })
      break
    }
    case 'end-year': {
      if (endMonth.error) {
        setEndMonth({
          ...endMonth,
          error: false
        })
      }
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

  function addDropdownStartMonth(id) {
    return (
      <Dropdown
        className="month"
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value) => {
          onChange(id, value)
        }}
        error={startMonth.error}
        errorMessage={startMonth.errorMsg}
        selectedItem={{
          title: props.phrases.chooseMonth,
          id: ''
        }}
        items={props.months}
      />
    )
  }

  function addDropdownEndMonth(id) {
    return (
      <Dropdown
        className="month"
        id={id}
        header={props.phrases.chooseMonth}
        onSelect={(value) => {
          onChange(id, value)
        }}
        error={endMonth.error}
        errorMessage={endMonth.errorMsg}
        selectedItem={{
          title: props.phrases.chooseMonth,
          id: ''
        }}
        items={props.months}
      />
    )
  }

  function addDropdownSerieEnebolig() {
    if (domene.value === 'ENEBOLIG') {
      return (
        <Dropdown
          className="serie-enebolig"
          id='serie'
          onSelect={(value) => {
            onChange('serie', value)
          }}
          error={serie.error}
          errorMessage={serie.errorMsg}
          selectedItem={{
            title: props.phrases.bkibolChooseWork,
            id: ''
          }}
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
          className="serie-boligblokk"
          id='serie'
          onSelect={(value) => {
            onChange('serie', value)
          }}
          error={serie.error}
          errorMessage={serie.errorMsg}
          selectedItem={{
            title: props.phrases.bkibolChooseWork,
            id: ''
          }}
          items={serieItemsDomene('BOLIGBLOKK')}
          ariaLabel={props.phrases.bkibolWorkTypeDone}
        />
      )
    }
  }

  function getPeriod(year, month) {
    return month === '' ? year : `${getMonthLabel(month)} ${year}`
  }

  function getMonthLabel(month) {
    const monthLabel = props.months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title.toLowerCase() : ''
  }

  function renderNumber(value) {
    if (endValue && change) {
      const decimalSeparator = (language === 'en') ? '.' : ','
      return (
        <React.Fragment>
          <NumberFormat
            value={ Number(value) }
            displayType={'text'}
            thousandSeparator={' '}
            decimalSeparator={decimalSeparator}
            decimalScale={1}
            fixedDecimalScale={true}
          />
        </React.Fragment>
      )
    }
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
    const priceChangeLabel = change.charAt(0) === '-' ? props.phrases.priceDecrease : props.phrases.priceIncrease
    return (
      <Container className="calculator-result" ref={scrollAnchor} tabIndex="0">
        <Row className="mb-5">
          <Col className="amount-equal col-12 col-md-4">
            <h3>{props.phrases.amountEqualled}</h3>
          </Col>
          <Col className="end-value col-12 col-md-8">
            <span className="float-left float-md-end">
              {renderNumberValute(endValue)}
            </span>
          </Col>
          <Col className="col-12">
            <Divider dark/>
          </Col>
        </Row>
        <Row className="mb-0 mb-lg-5">
          <Col className="price-increase col-12 col-lg-4">
            <span>{priceChangeLabel}</span>
            <span className="float-end">
              {renderNumberChangeValue()}
            </span>
            <Divider dark/>
          </Col>
          <Col className="start-value col-12 col-lg-4">
            <span>{props.phrases.amount} {startPeriod}</span>
            <span className="float-end">
              {renderNumberValute(startValueResult)}
            </span>
            <Divider dark/>
          </Col>
          <Col className="amount col-12 col-lg-4">
            <span>{props.phrases.amount} {endPeriod}</span>
            <span className="float-end">
              {renderNumberValute(endValue)}
            </span>
            <Divider dark/>
          </Col>
        </Row>
        <Row>
          <Col className="start-value col-12 col-lg-4 offset-lg-4">
            <span>{props.phrases.index} {startPeriod}</span>
            <span className="float-end">
              {renderNumber(startIndex)}
            </span>
            <Divider dark/>
          </Col>
          <Col className="amount col-12 col-lg-4">
            <span>{props.phrases.index} {endPeriod}</span>
            <span className="float-end">
              {renderNumber(endIndex)}
            </span>
            <Divider dark/>
          </Col>
        </Row>
        <Row>
          <Col className="md-6">
            <Button className="close-button" onClick={() => closeResult()} type="button"> <X size="18"/>{props.phrases.close}</Button>
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
              <FormError errorMessages={[errorMessage || props.phrases.pifErrorUnknownError]} title={props.phrases.pifErrorCalculationFailed} />
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
          <Link className="float-md-end" href={props.calculatorArticleUrl}>{props.phrases.readAboutCalculator}</Link>
        </Col>
      )
    }
  }

  function renderForm() {
    return (
      <div className="calculator-form">
        <Row>
          <Col>
            <Title size={2}>{props.phrases.bkibolTitle}</Title>
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
            <Row className="my-5">
              <Col className="choose-domene col-12 col-md-6 col-xl-4 mb-3 mb-md-0">
                <Title size={3}>{props.phrases.bkibolChooseDwellingType}</Title>
                <RadioGroup
                  onChange={(value) => {
                    onChange('domene', value)
                  }}
                  selectedValue='ENEBOLIG'
                  orientation='column'
                  items={[
                    {
                      label: props.phrases.bkibolDetachedHouse,
                      value: 'ENEBOLIG'
                    },
                    {
                      label: props.phrases.bkibolMultiDwellingHouse,
                      value: 'BOLIGBLOKK'
                    }
                  ]}
                />
              </Col>
              <Col className="select-serie col-12 col-md-6 col-xl-6">
                <Title size={3}>{props.phrases.bkibolWorkTypeDone}</Title>
                { addDropdownSerieEnebolig() }
                { addDropdownSerieBoligblokk() }
              </Col>
            </Row>
            <Divider/>
            <Row className="my-5">
              <Col className="choose-scope col-12 col-md-6 col-xl-4 mb-3 mb-md-0">
                <Title size={3}>{props.phrases.bkibolAmountInclude}</Title>
                <RadioGroup
                  onChange={(value) => {
                    onChange('scope', value)
                  }}
                  selectedValue='ALT'
                  orientation='column'
                  items={[
                    {
                      label: props.phrases.bkibolExpenditureAll,
                      value: 'ALT'
                    },
                    {
                      label: props.phrases.bkibolExpenditureMatrials,
                      value: 'MATERIALER'
                    }
                  ]}
                />
              </Col>
              <Col className="input-amount col-12 col-md-6 col-xl-8">
                <h3 id="amount">{props.phrases.bkibolAmount}</h3>
                <Input
                  className="start-value"
                  handleChange={(value) => onChange('start-value', value)}
                  error={startValue.error}
                  errorMessage={startValue.errorMsg}
                  onBlur={() => onBlur('start-value')}
                  ariaLabelledBy="amount"
                />
              </Col>
            </Row>
            <Divider/>
            <Row className="mt-5">
              <Col className="calculate-from col-12 col-md-6">
                <h3>{props.phrases.calculatePriceChangeFrom}</h3>
                <Container>
                  <Row>
                    <Col className="select-year col-sm-5">
                      <Input
                        className="input-year"
                        label={props.phrases.fromYear}
                        handleChange={(value) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                    <Col className="select-month col-sm-7">
                      {addDropdownStartMonth('start-month')}
                    </Col>
                  </Row>
                </Container>
              </Col>
              <Col className="calculate-to col-12 col-md-6">
                <h3>{props.phrases.calculatePriceChangeTo}</h3>
                <Container>
                  <Row>
                    <Col className="select-year col-sm-5">
                      <Input
                        className="input-year"
                        label={props.phrases.toYear}
                        handleChange={(value) => onChange('end-year', value)}
                        error={endYear.error}
                        errorMessage={endYear.errorMsg}
                        onBlur={() => onBlur('end-year')}
                      />
                    </Col>
                    <Col className="select-month col-sm-7">
                      {addDropdownEndMonth('end-month' )}
                    </Col>
                  </Row>
                </Container>
              </Col>
            </Row>
            <Row className="submit">
              <Col>
                <Button className="submit-button" primary type="submit" disabled={loading}>{props.phrases.seePriceChange}</Button>
              </Col>
            </Row>
          </Container>
        </Form>
      </div>
    )
  }

  return (
    <Container className='bkibol-calculator'>
      {renderForm()}
      {renderResult()}
    </Container>
  )
}

BkibolCalculator.defaultValue = {
  bkibolServiceUrl: null,
  language: 'nb'
}

BkibolCalculator.propTypes = {
  bkibolServiceUrl: PropTypes.string,
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
  lastNumberText: PropTypes.string,
  lastUpdated: PropTypes.shape({
    month: PropTypes.string,
    year: PropTypes.string
  })
}

export default (props) => <BkibolCalculator {...props} />
