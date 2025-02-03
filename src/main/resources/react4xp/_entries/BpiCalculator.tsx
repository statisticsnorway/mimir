import React, { useState } from 'react'
import { Title, Divider, RadioGroup, Dropdown, Input, Button, FormError } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col, Form } from 'react-bootstrap'

import axios from 'axios'
import { NumericFormat } from 'react-number-format'
import { X } from 'react-feather'

import { BpiCalculatorProps } from '/lib/types/partTypes/bpiCalculator'
import { CalculatorState, useSetupCalculator } from '/lib/ssb/utils/customHooks/calculatorHooks'
import { DropdownItem } from '/lib/types/components'

function BpiCalculator(props: BpiCalculatorProps) {
  const {
    bpiCalculatorServiceUrl,
    language,
    months,
    phrases,
    lastUpdated,
    nextPublishText,
    lastNumberText,
    dwellingTypeList,
    regionList,
    quarterPeriodList,
  } = props

  const defaultRegion = { id: '', title: phrases.bpiChooseRegion }
  const [dwellingType, setDwellingType] = useState({
    error: false,
    errorMsg: '',
    value: '',
  })
  const [region, setRegion] = useState({
    error: false,
    errorMsg: phrases.bpiValidateRegion,
    value: defaultRegion,
  })

  const defaultQuartalValue = { id: '', title: phrases.calculatorChooseQuartalPeriod }
  const {
    states: {
      loading,
      errorMessage,
      startValue,
      endValue,
      startYear,
      endYear,
      startMonth,
      endMonth,
      startPeriod,
      endPeriod,
      change,
      startValueResult,
      startIndex,
      endIndex,
    },
    setters: {
      setLoading,
      setErrorMessage,
      setChange,
      setEndValue,
      setStartPeriod,
      setEndPeriod,
      setStartValueResult,
      setStartIndex,
      setEndIndex,
      onChange,
    },
    validation: { onBlur, isStartValueValid, isStartYearValid, isEndYearValid, isStartMonthValid, isEndMonthValid },
    scrollAnchor,
    onSubmitBtnElement,
    getQuartalPeriod,
    closeResult,
  } = useSetupCalculator({
    calculatorValidateAmountNumber: phrases.calculatorValidateAmountNumber,
    defaultMonthValue: defaultQuartalValue,
    defaultMonthErrorMsg: phrases.calculatorValidateQuartal,
    lastNumberText,
    calculatorValidateYear: phrases.calculatorValidateYear,
    validMaxYear: lastUpdated.year,
    validMaxMonth: lastUpdated.month,
    validMinYear: 1992,
    months,
  })

  function onCategoryChange(id: string, value: CalculatorState['value']) {
    switch (id) {
      case 'dwellingType': {
        setDwellingType({ ...dwellingType, value: value as string })
        break
      }
      case 'region': {
        setRegion({
          ...region,
          value: value as DropdownItem,
          error: region.error ? !isRegionValid((value as DropdownItem).id) : region.error,
        })
        break
      }
      default: {
        break
      }
    }
  }

  function isRegionValid(value?: string) {
    const regionValue = value || region.value.id
    const regionValid = regionValue !== ''
    if (!regionValid) {
      setRegion({
        ...region,
        error: true,
      })
    }
    return regionValid
  }

  function isFormValid() {
    return (
      isRegionValid() &&
      isStartValueValid() &&
      isStartYearValid() &&
      isStartMonthValid() &&
      isEndYearValid() &&
      isEndMonthValid()
    )
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return
    setChange(null)
    setEndValue(null)
    if (!isFormValid()) {
      onBlur('start-value')
      onBlur('start-year')
      onBlur('start-month')
      onBlur('end-year')
      onBlur('end-month')
      return
    }
    setErrorMessage(null)
    setLoading(true)
    axios
      .get(bpiCalculatorServiceUrl, {
        params: {
          dwellingType: dwellingType.value,
          region: region.value.id,
          startValue: startValue.value,
          startYear: startYear.value,
          startQuartalPeriod: (startMonth.value as DropdownItem).id,
          endYear: endYear.value,
          endQuartalPeriod: (endMonth.value as DropdownItem).id,
          language: language,
        },
      })
      .then((res) => {
        const startPeriod = getQuartalPeriod(startYear.value as string, (startMonth.value as DropdownItem).title)
        const endPeriod = getQuartalPeriod(endYear.value as string, (endMonth.value as DropdownItem).title)
        setChange(res.data.change)
        setEndValue(res.data.endValue)
        setStartPeriod(startPeriod)
        setEndPeriod(endPeriod)
        setStartIndex(res.data.startIndex.toFixed(1))
        setEndIndex(res.data.endIndex.toFixed(1))
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
      })
  }

  function addDropdownChooseQuarter(id: 'start-month' | 'end-month') {
    return (
      <Dropdown
        className='month'
        id={id}
        header={phrases.calculatorChooseQuartalPeriod}
        onSelect={(value: DropdownItem) => onChange(id, value)}
        error={id === 'start-month' ? startMonth.error : endMonth.error}
        errorMessage={id === 'start-month' ? startMonth.errorMsg : endMonth.errorMsg}
        selectedItem={id === 'start-month' ? startMonth.value : endMonth.value}
        items={quarterPeriodList}
      />
    )
  }

  function renderForm() {
    return (
      <div className='calculator-form'>
        <Row>
          <Col>
            <Title size={2}>{phrases.bpiCalculatorTitle}</Title>
          </Col>
        </Row>
        <Row>
          <Col>
            <p className='publish-text'>{nextPublishText}</p>
          </Col>
        </Row>
        <Form onSubmit={onSubmit}>
          <Container>
            <Row className='mt-5'>
              <Col className='col-12 col-md-6 col-xl-4 mb-3 mb-md-0'>
                <Title size={3}>{phrases.bpiChooseDwellingType}</Title>
                <RadioGroup
                  selectedValue={dwellingTypeList[0].value}
                  orientation='column'
                  items={dwellingTypeList}
                  onChange={(value: string) => onCategoryChange('dwellingType', value)}
                />
              </Col>
              <Col className='col-12 col-md-6 col-xl-6'>
                <Title size={3}>{phrases.bpiChooseRegion}</Title>
                <Dropdown
                  className='select-region'
                  selectedItem={region.value}
                  items={regionList}
                  onSelect={(value: DropdownItem) => onCategoryChange('region', value)}
                  error={region.error}
                  errorMessage={region.errorMsg}
                  ariaLabel={phrases.bpiChooseRegion}
                />
              </Col>
            </Row>
            <Divider className='my-5' />
            <Row className='d-flex justify-content-end'>
              <Col className='input-amount col-12 col-md-6 col-xl-8'>
                <h3 id='amount'>{phrases.amount}</h3>
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
            <Divider className='my-5' />
            <Row>
              <Col className='calculate-from col-12 col-lg-6'>
                <Title size={3}>{phrases.calculatePriceChangeFrom}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={phrases.fromYear}
                        ariaLabel={phrases.fromYearScreenReader}
                        handleChange={(value: string) => onChange('start-year', value)}
                        error={startYear.error}
                        errorMessage={startYear.errorMsg}
                        onBlur={() => onBlur('start-year')}
                      />
                    </Col>
                    <Col className='select-month col-12 col-sm-7'>{addDropdownChooseQuarter('start-month')}</Col>
                  </Row>
                </Container>
              </Col>
              <Col className='calculate-to col-12 col-lg-6'>
                <Title size={3}>{phrases.calculatePriceChangeTo}</Title>
                <Container>
                  <Row>
                    <Col className='select-year col-sm-5'>
                      <Input
                        className='input-year'
                        label={phrases.toYear}
                        ariaLabel={phrases.toYearScreenReader}
                        handleChange={(value: string) => onChange('end-year', value)}
                        error={endYear.error}
                        errorMessage={endYear.errorMsg}
                        onBlur={() => onBlur('end-year')}
                      />
                    </Col>
                    <Col className='select-month col-12 col-sm-7'>{addDropdownChooseQuarter('end-month')}</Col>
                  </Row>
                </Container>
              </Col>
            </Row>
          </Container>
          <Row className='submit'>
            <Col>
              <Button ref={onSubmitBtnElement} className='submit-button' primary type='submit' disabled={loading}>
                {phrases.seePriceChange}
              </Button>
            </Col>
          </Row>
        </Form>
      </div>
    )
  }

  function renderNumber(value: string | number, type?: string) {
    if (endValue && change) {
      const decimalSeparator = language === 'en' ? '.' : ','
      if (type === 'valute' || type === 'change') {
        const valute = language === 'en' ? 'NOK' : 'kr'
        const decimalScale = type === 'valute' ? 2 : 1
        return (
          <React.Fragment>
            <NumericFormat
              value={Number(value)}
              displayType='text'
              thousandSeparator=' '
              decimalSeparator={decimalSeparator}
              decimalScale={decimalScale}
              fixedDecimalScale
            />
            {type === 'valute' ? valute : '%'}
          </React.Fragment>
        )
      } else {
        return (
          <NumericFormat
            value={Number(value)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={1}
            fixedDecimalScale
          />
        )
      }
    }
  }

  function calculatorResult() {
    const priceChangeLabel = change?.charAt(0) === '-' ? phrases.priceDecrease : phrases.priceIncrease
    const changeValue = change?.charAt(0) === '-' ? change.replace('-', '') : (change ?? '')
    const endValueText = endValue?.toString() ?? ''
    const startIndexText = startIndex?.toString() ?? ''
    const endIndexText = endIndex?.toString() ?? ''
    const bpiResultForScreenreader = phrases.calculatorResultScreenReader
      .replace('{0}', language === 'en' ? endValueText : endValueText.replace('.', ','))
      .replace('{1}', priceChangeLabel)
      .replace('{2}', language === 'en' ? changeValue : changeValue.replace('.', ','))
      .replaceAll('{3}', startPeriod ?? '')
      .replaceAll('{4}', endPeriod ?? '')
      .replace('{5}', language === 'en' ? startIndexText : startIndexText.replace('.', ','))
      .replace('{6}', language === 'en' ? endIndexText : endIndexText.replace('.', ','))

    return (
      <Container className='calculator-result' ref={scrollAnchor} tabIndex={0}>
        <div aria-atomic='true'>
          <span className='sr-only'>{bpiResultForScreenreader}</span>
        </div>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='amount-equal col-12 col-md-4'>
            <h3>{phrases.amountEqualled}</h3>
          </Col>
          <Col className='end-value col-12 col-md-8'>
            <span className='float-start float-md-end'>{renderNumber(endValue!, 'valute')}</span>
          </Col>
          <Col className='col-12'>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='col-12 col-lg-4'>
            <span>{priceChangeLabel}</span>
            <span className='float-end'>{renderNumber(changeValue!, 'change')}</span>
            <Divider dark />
          </Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {phrases.amount} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startValueResult!, 'change')}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {phrases.amount} {endPeriod}
            </span>
            <span className='float-end'>{renderNumber(endValue!, 'change')}</span>
            <Divider dark />
          </Col>
        </Row>
        <Row className='mb-5' aria-hidden='true'>
          <Col className='col-12 col-lg-4'></Col>
          <Col className='start-value col-12 col-lg-4'>
            <span>
              {phrases.index} {startPeriod}
            </span>
            <span className='float-end'>{renderNumber(startIndex!)}</span>
            <Divider dark />
          </Col>
          <Col className='col-12 col-lg-4'>
            <span>
              {phrases.index} {endPeriod}
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
              {phrases.close}
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
                errorMessages={[errorMessage || phrases.calculatorUknownError]}
                title={phrases.calculatorErrorCalculationFailed}
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

  return (
    <Container className='content'>
      {renderForm()}
      <div aria-live='polite'>{renderResult()}</div>
    </Container>
  )
}

export default (props: BpiCalculatorProps) => <BpiCalculator {...props} />
