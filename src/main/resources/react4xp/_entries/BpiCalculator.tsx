import React, { useState } from 'react'
import { Title, Divider, RadioGroup, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { Container, Row, Col, Form } from 'react-bootstrap'

import axios from 'axios'

import { BpiCalculatorProps } from '/lib/types/partTypes/bpiCalculator'
import { CalculatorState, useSetupCalculator } from '/lib/ssb/utils/customHooks/calculatorHooks'
import { DropdownItem } from '/lib/types/components'
import CalculatorLayout from '../calculator/CalculatorLayout'

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
        setDwellingType((prevState) => ({ ...prevState, value: value as string }))
        break
      }
      case 'region': {
        setRegion((prevState) => ({
          ...prevState,
          value: value as DropdownItem,
          error: prevState.error ? !isRegionValid((value as DropdownItem).id) : prevState.error,
        }))
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
      setRegion((prevState) => ({
        ...prevState,
        error: true,
      }))
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
        const startPeriod = getQuartalPeriod((startMonth.value as DropdownItem).title, startYear.value as string)
        const endPeriod = getQuartalPeriod((endMonth.value as DropdownItem).title, endYear.value as string)
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
    )
  }

  function prepCalculatorResults() {
    if (endValue && change) {
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

      return {
        resultHeader: {
          label: phrases.amountEqualled,
          value: endValue!,
          type: 'valute',
        },
        resultRows: [
          [
            {
              label: priceChangeLabel,
              value: changeValue!,
              type: 'change',
            },
            {
              label: `${phrases.amount} ${startPeriod}`,
              value: startValueResult!,
              type: 'valute',
            },
            {
              label: `${phrases.amount} ${endPeriod}`,
              value: endValue!,
              type: 'valute',
            },
          ],
          [
            {
              label: `${phrases.index} ${startPeriod}`,
              value: startIndex!,
            },
            {
              label: `${phrases.index} ${endPeriod}`,
              value: endIndex!,
            },
          ],
        ],
        onClose: closeResult,
        closeButtonText: phrases.close,
        screenReaderResultText: bpiResultForScreenreader,
        scrollAnchor,
      }
    }
  }

  return (
    <CalculatorLayout
      calculatorTitle={phrases.bpiCalculatorTitle}
      nextPublishText={nextPublishText}
      language={language}
      loading={loading}
      errorMessage={errorMessage}
      calculatorUknownError={phrases.calculatorUknownError}
      calculatorErrorCalculationFailed={phrases.calculatorErrorCalculationFailed}
      renderResult={prepCalculatorResults}
      renderForm={renderForm}
    />
  )
}

export default (props: BpiCalculatorProps) => <BpiCalculator {...props} />
