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

  const defaultQuartalValue = { id: '', title: phrases.bpiChooseQuartalPeriod }
  const validMinYear = 1992
  const validMaxYear = lastUpdated.year
  const {
    states: {
      loading,
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
      errorMessage,
      startIndex,
      endIndex,
    },
    setters: {
      setStartValueResult,
      setEndValue,
      setChange,
      setLoading,
      setErrorMessage,
      setStartIndex,
      setEndIndex,
      setStartPeriod,
      setEndPeriod,
      onChange,
    },
    validation: { onBlur, isStartYearValid, isEndYearValid, isStartMonthValid, isEndMonthValid },
    scrollAnchor,
    onSubmitBtnElement,
    getQuartalPeriod,
    closeResult,
  } = useSetupCalculator({
    calculatorValidateAmountNumber: phrases.calculatorValidateAmountNumber,
    defaultMonthValue: defaultQuartalValue,
    defaultMonthErrorMsg: phrases.bpiValidateQuartal,
    lastNumberText,
    validYearErrorMsg: `${phrases.pifValidateYear.replaceAll('{0}', validMinYear.toString())} ${validMaxYear}`,
    validMaxYear,
    validMaxMonth: lastUpdated.month,
    validMinYear,
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
    return isRegionValid() && isStartYearValid() && isStartMonthValid() && isEndYearValid() && isEndMonthValid()
  }

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (loading) return
    setChange(null)
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
          startQuartalPeriod: startMonth?.value.id,
          endYear: endYear.value,
          endQuartalPeriod: endMonth?.value.id,
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

  // TODO: Revise; consider making new functions for quarter
  function addDropdownChooseStartQuarter(id: string) {
    return (
      <Dropdown
        className='month'
        id={id}
        header={phrases.bpiChooseQuartalPeriod}
        onSelect={(value: DropdownItem) => onChange(id, value)}
        error={startMonth.error}
        errorMessage={startMonth.errorMsg}
        selectedItem={startMonth.value}
        items={quarterPeriodList}
      />
    )
  }
  function addDropdownChooseEndQuarter(id: string) {
    return (
      <Dropdown
        className='month'
        id={id}
        header={phrases.bpiChooseQuartalPeriod}
        onSelect={(value: DropdownItem) => onChange(id, value)}
        error={endMonth.error}
        errorMessage={endMonth.errorMsg}
        selectedItem={endMonth.value}
        items={quarterPeriodList}
      />
    )
  }

  // TODO: Check if it's possible to make this into a React template component that can be used by all calculators
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
              <Col className='col-12 col-lg-4'>
                <Title size={3}>{phrases.bpiChooseDwellingType}</Title>
                <RadioGroup
                  selectedValue={dwellingTypeList[0].value}
                  orientation='column'
                  items={dwellingTypeList}
                  onChange={(value: string) => onCategoryChange('dwellingType', value)}
                />
              </Col>
              <Col className='col-12 col-lg-8'>
                <Title size={3}>{phrases.bpiChooseRegion}</Title>
                <Dropdown
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
              <Col className='input-amount col-12 col-md-6 col-xl-8 pt-0'>
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
            <Divider className='my-5' />
            {/* TODO: This part of the field is almost, if not, the same for all calculators */}
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
                    <Col className='select-month col-12 col-sm-7'>{addDropdownChooseStartQuarter('start-month')}</Col>
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
                    <Col className='select-month col-12 col-sm-7'>{addDropdownChooseEndQuarter('end-month')}</Col>
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
    const priceChangeLabel = change?.charAt(0) === '-' ? phrases.priceDecrease : phrases.priceIncrease
    const changeValue = change?.charAt(0) === '-' ? change.replace('-', '') : (change ?? '')
    const endValueText = endValue?.toString() ?? ''
    const startIndexText = startIndex?.toString() ?? ''
    const endIndexText = endIndex?.toString() ?? ''
    const bpiResultForScreenreader = phrases.pifResultForScreenreader
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
                errorMessages={[errorMessage || phrases.pifErrorUnknownError]}
                title={phrases.pifErrorCalculationFailed}
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
