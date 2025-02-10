import React, { useState, useEffect } from 'react'
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
  const defaultValidMinYear = 2005
  const [validMinYear, setValidMinYear] = useState(defaultValidMinYear)

  const defaultQuarterValue = { id: '', title: phrases.calculatorChooseQuarterPeriod }
  const {
    states: {
      loading,
      errorMessage,
      startValue,
      endValue,
      startYear,
      endYear,
      startPeriod,
      endPeriod,
      startPeriodLabel,
      endPeriodLabel,
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
      setStartPeriodLabel,
      setEndPeriodLabel,
      setStartValueResult,
      setStartIndex,
      setEndIndex,
      onChange,
    },
    validation: { onBlur, isStartValueValid, isStartYearValid, isEndYearValid, isStartPeriodValid, isEndPeriodValid },
    scrollAnchor,
    onSubmitBtnElement,
    getResultQuarterPeriod,
    closeResult,
  } = useSetupCalculator({
    calculatorValidateAmountNumber: phrases.calculatorValidateAmountNumber,
    defaultMonthValue: defaultQuarterValue,
    defaultMonthErrorMsg: phrases.calculatorValidateQuarter,
    lastNumberText,
    calculatorValidateYear: phrases.calculatorValidateYear,
    validMaxYear: lastUpdated.year,
    validMaxMonth: lastUpdated.month as string,
    validMinYear,
    months,
    calculatorNextQuarterPeriodText: phrases.calculatorNextQuarterPeriod,
  })

  useEffect(() => {
    // Only options "TOTAL = The whole country", "001 = Oslo including Bærum", and '005 = Akershus excluding Bærum' has data dating back to 1992
    if (region.value.id === 'TOTAL' || region.value.id === '001' || region.value.id === '005') {
      setValidMinYear(1992)
    } else {
      setValidMinYear(defaultValidMinYear)
    }
  }, [region])

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
      isStartPeriodValid() &&
      isEndYearValid() &&
      isEndPeriodValid()
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
      onBlur('start-period')
      onBlur('end-year')
      onBlur('end-period')
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
          startQuarterPeriod: (startPeriod.value as DropdownItem).id,
          endYear: endYear.value,
          endQuarterPeriod: (endPeriod.value as DropdownItem).id,
          language: language,
        },
      })
      .then((res) => {
        const startPeriodLabel = getResultQuarterPeriod(
          (startPeriod.value as DropdownItem).id,
          startYear.value as string
        )
        const endPeriodLabel = getResultQuarterPeriod((endPeriod.value as DropdownItem).id, endYear.value as string)
        setChange(res.data.change)
        setEndValue(res.data.endValue)
        setStartPeriodLabel(startPeriodLabel)
        setEndPeriodLabel(endPeriodLabel)
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

  function addDropdownChooseQuarter(id: 'start-period' | 'end-period') {
    return (
      <Dropdown
        className='period'
        id={id}
        header={phrases.calculatorChooseQuarterPeriod}
        onSelect={(value: DropdownItem) => onChange(id, value)}
        error={id === 'start-period' ? startPeriod.error : endPeriod.error}
        errorMessage={id === 'start-period' ? startPeriod.errorMsg : endPeriod.errorMsg}
        selectedItem={id === 'start-period' ? startPeriod.value : endPeriod.value}
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
              <h3 id='amount' className='mt-3'>
                {phrases.amount}
              </h3>
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
                  <Col className='select-period col-12 col-sm-7'>{addDropdownChooseQuarter('start-period')}</Col>
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
                  <Col className='select-period col-12 col-sm-7'>{addDropdownChooseQuarter('end-period')}</Col>
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

  function prepCalculatorResult() {
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
        .replaceAll('{3}', startPeriodLabel ?? '')
        .replaceAll('{4}', endPeriodLabel ?? '')
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
              label: `${phrases.amount} ${startPeriodLabel}`,
              value: startValueResult!,
              type: 'valute',
            },
            {
              label: `${phrases.amount} ${endPeriodLabel}`,
              value: endValue!,
              type: 'valute',
            },
          ],
          [
            {
              label: `${phrases.index} ${startPeriodLabel}`,
              value: startIndex!,
            },
            {
              label: `${phrases.index} ${endPeriodLabel}`,
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
      renderResult={prepCalculatorResult}
      renderForm={renderForm}
    />
  )
}

export default (props: BpiCalculatorProps) => <BpiCalculator {...props} />
