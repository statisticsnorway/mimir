import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, Divider, Dialog } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import NumberFormat from 'react-number-format'

function KpiCalculator(props) {
  const [validated, setValidated] = useState(false)
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

  useEffect(() => {
    setValidated(
      !startValue.error && startValue.value &&
      !startYear.error && startYear.value &&
      !startMonth.error && startMonth.value &&
      !endYear.error && endYear.value &&
      !endMonth.error && endMonth.value
    )
  }, [startValue, startYear, startMonth, endYear, endMonth])

  function onSubmit(e) {
    e.preventDefault()
    if (!validated || loading) return
    setChange(null)
    setEndValue(null)
    setErrorMessage(null)
    setLoading(true)
    axios.get(props.kpiServiceUrl, {
      params: {
        startValue: startValue.value,
        startYear: startYear.value,
        startMonth: startMonth.value,
        endYear: endYear.value,
        endMonth: endMonth.value
      }
    })
      .then((res) => {
        const changeVal = (res.data.change * 100).toFixed(1)
        const endVal = (res.data.endValue).toFixed(2)
        setChange(changeVal)
        setEndValue(endVal)
      })
      .catch((err) => {
        // TODO better errorhandling
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

  function onChange(id, value) {
    switch (id) {
    case 'start-value': {
      const test = value.match(/^-?[0-9]+[.,]?[0-9]*$/g)
      const isNumber = test && test.length === 1
      value = value.replace(/,/g, '.')
      const error = !isNumber || isNaN(parseFloat(value))
      setStartValue({
        ...startValue,
        value,
        error
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
      const validMaxYear = new Date().getFullYear()
      const validMinYear = 1865
      const test = value.match(/^[1-9]{1}[0-9]{3}$/g)
      const isYear = test && test.length === 1
      const intVal = parseInt(value)
      const error = !isYear || isNaN(intVal) || intVal < validMinYear || intVal > validMaxYear
      setStartYear({
        ...startYear,
        value,
        error
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
      const validMaxYear = new Date().getFullYear()
      const validMinYear = 1865
      const test = value.match(/^[1-9]{1}[0-9]{3}$/g)
      const isYear = test && test.length === 1
      const intVal = parseInt(value)
      const error = !isYear || isNaN(intVal) || intVal < validMinYear || intVal > validMaxYear
      setEndYear({
        ...endYear,
        value,
        error
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
            <Dialog type='warning' title="Beregning feilet">
              {errorMessage || 'Ukjent feil, prøv igjen'}
            </Dialog>
          </Col>
        </Row>
      )
    }
    if (endValue && change) {
      const decimalSeparator = (props.language === 'en') ? '.' : ','
      const valute = (props.language === 'en') ? 'NOK' : 'kr'
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
    <Form onSubmit={onSubmit} validated={validated}>
      <Container>
        <Row>
          <Col>
            <h3>{props.phrases.enterAmount}</h3>
            <Input handleChange={(value) => onChange('start-value', value)} error={startValue.error} errorMessage={startValue.errorMsg}/>
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
                    errorMessage={startYear.errorMsg}/>
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
                    errorMessage={endYear.errorMsg}/>
                </Col>
              </Row>
            </Container>
          </Col>
        </Row>
        <Row className="my-4">
          <Col>
            <Button primary type="submit" disabled={!validated || loading}>{props.phrases.calculatePriceChange}</Button>
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
  language: 'no'
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
