import { useEffect, useRef, useState } from 'react'
import { type DropdownItem, type DropdownItems } from '/lib/types/components'
import { getQuartalNumber, getMonthByQuartal } from '/lib/ssb/utils/calculatorUtils'

interface UseSetupCalculatorProps {
  calculatorValidateAmountNumber?: string
  defaultMonthValue?: DropdownItem
  defaultMonthErrorMsg?: string
  lastNumberText: string
  calculatorValidateYear?: string
  validMaxYear: string | number
  validMaxMonth: string | number
  validMinYear: number
  months: DropdownItems
  calculatorNextQuartalPeriodText?: string
}

export interface CalculatorState {
  error: boolean
  errorMsg: string
  value?: DropdownItem | string
}

export const useSetupCalculator = ({
  calculatorValidateAmountNumber,
  defaultMonthValue,
  defaultMonthErrorMsg = '',
  lastNumberText,
  calculatorValidateYear,
  validMaxYear,
  validMaxMonth,
  validMinYear,
  months,
  calculatorNextQuartalPeriodText = '',
}: UseSetupCalculatorProps) => {
  const validYearErrorMsg = calculatorValidateYear
    ? `${calculatorValidateYear.replaceAll('{0}', validMinYear.toString())} ${validMaxYear}`
    : ''
  const [startValue, setStartValue] = useState({
    error: false,
    errorMsg: calculatorValidateAmountNumber,
    value: '',
  })
  const [startPeriod, setStartPeriod] = useState<CalculatorState>({
    error: false,
    errorMsg: lastNumberText,
    value: defaultMonthValue,
  })

  const [startYear, setStartYear] = useState<CalculatorState>({
    error: false,
    errorMsg: validYearErrorMsg,
    value: '',
  })

  const [endPeriod, setEndPeriod] = useState<CalculatorState>({
    error: false,
    errorMsg: lastNumberText,
    value: defaultMonthValue,
  })

  const [endYear, setEndYear] = useState<CalculatorState>({
    error: false,
    errorMsg: validYearErrorMsg,
    value: '',
  })

  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [change, setChange] = useState<string | null>(null)
  const [endValue, setEndValue] = useState<null | number>(null)
  const [startResultPeriod, setStartResultPeriod] = useState<string | null>(null)
  const [endResultPeriod, setEndResultPeriod] = useState<string | null>(null)
  const [startValueResult, setStartValueResult] = useState<string | null>(null)
  const [startIndex, setStartIndex] = useState<number | null>(null)
  const [endIndex, setEndIndex] = useState<number | null>(null)

  const scrollAnchor = useRef<HTMLDivElement>(null)
  const onSubmitBtnElement = useRef<HTMLButtonElement>(null)

  const yearRegexp = /^[1-9]\d{3}$/g

  function isStartValueValid(value?: string) {
    const startVal = value || startValue.value
    const testStartValue = startVal.match(/^-?\d+(?:[.,]\d*)?$/g)
    const isNumber = testStartValue && testStartValue.length === 1
    return !(!isNumber || isNaN(parseFloat(startVal)))
  }

  function isStartYearValid(value?: string) {
    const startYearValue = value || (startYear.value as string)
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
    const endYearValue = value || (endYear.value as string)
    const testEndYear = endYearValue.match(yearRegexp)
    const isEndYearValid = testEndYear && testEndYear.length === 1
    const intEndYear = parseInt(endYearValue)
    return !(!isEndYearValid || isNaN(intEndYear) || intEndYear < validMinYear || intEndYear > Number(validMaxYear))
  }

  // We use months for validation calculations so quarter values e.g. K1 gets converted to month
  function getPeriodOrQuartalPeriodMonthValue(periodValue: string) {
    const isQuartalPeriod = periodValue !== '' && isNaN(Number(periodValue))
    return isQuartalPeriod ? (getMonthByQuartal(getQuartalNumber(periodValue)) as number) : periodValue
  }

  function isStartPeriodValid(value?: string) {
    const startPeriodValue = value || (startPeriod.value as DropdownItem).id
    const startPeriodOrQuartalPeriodMonthValue = getPeriodOrQuartalPeriodMonthValue(startPeriodValue)

    const startPeriodValid = !(startYear.value === validMaxYear && startPeriodOrQuartalPeriodMonthValue > validMaxMonth)
    if (!startPeriodValid) {
      setStartPeriod((prevState) => ({
        ...prevState,
        error: true,
      }))
    }
    return startPeriodValue === '' ? false : startPeriodValid
  }

  function isEndPeriodValid(value?: string) {
    const endPeriodValue = value || (endPeriod.value as DropdownItem).id
    const endPeriodOrQuartalPeriodMonthValue = getPeriodOrQuartalPeriodMonthValue(endPeriodValue)

    const maxYearAverage = Number(validMaxMonth) === 12 ? validMaxYear : Number(validMaxYear) - 1
    const endPeriodValid =
      endPeriodValue === '90'
        ? (endYear.value as string) <= maxYearAverage
        : !(endYear.value === validMaxYear && endPeriodOrQuartalPeriodMonthValue > validMaxMonth)

    if (!endPeriodValid) {
      setEndPeriod((prevState) => ({
        ...prevState,
        error: true,
      }))
    }
    return endPeriodValue === '' ? false : endPeriodValid
  }

  function onBlur(id: string) {
    switch (id) {
      case 'start-value': {
        setStartValue((prevState) => ({
          ...prevState,
          error: !isStartValueValid(),
        }))
        break
      }
      case 'start-year': {
        setStartYear((prevState) => ({
          ...prevState,
          error: !isStartYearValid(),
        }))
        break
      }
      case 'end-year': {
        setEndYear((prevState) => ({
          ...prevState,
          error: !isEndYearValid(),
        }))
        break
      }
      case 'start-period': {
        setStartPeriod((prevState) => ({
          ...prevState,
          error: !isStartPeriodValid(),
          errorMsg: (prevState.value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      case 'end-period': {
        setEndPeriod((prevState) => ({
          ...prevState,
          error: !isEndPeriodValid(),
          errorMsg: (prevState.value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      default: {
        break
      }
    }
  }

  function onChange(id: string, value: CalculatorState['value']) {
    switch (id) {
      case 'start-value': {
        value = (value as string).replace(/,/g, '.')
        setStartValue((prevState) => ({
          ...prevState,
          value: value as string,
          error: prevState.error ? !isStartValueValid(value as string) : prevState.error,
        }))
        break
      }
      case 'start-period': {
        setStartPeriod((prevState) => ({
          ...prevState,
          value,
          error: prevState.error ? !isStartPeriodValid((value as DropdownItem)?.id as string) : prevState.error,
          errorMsg: (value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      case 'start-year': {
        if (startPeriod.error) {
          setStartPeriod((prevState) => ({
            ...prevState,
            error: false,
          }))
        }
        setStartYear((prevState) => ({
          ...prevState,
          value,
          error: prevState.error ? !isStartYearValid(value as string) : prevState.error,
        }))
        break
      }
      case 'end-period': {
        setEndPeriod((prevState) => ({
          ...prevState,
          value,
          error: prevState.error ? !isEndPeriodValid((value as DropdownItem)?.id) : prevState.error,
          errorMsg: (value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      case 'end-year': {
        if (endPeriod.error) {
          setEndPeriod((prevState) => ({
            ...prevState,
            error: false,
          }))
        }
        setEndYear((prevState) => ({
          ...prevState,
          value,
          error: prevState.error ? !isEndYearValid(value as string) : prevState.error,
        }))
        break
      }
      default: {
        break
      }
    }
  }

  function closeResult() {
    setEndValue(null)
    setChange(null)
    if (onSubmitBtnElement.current) onSubmitBtnElement.current.focus()
  }

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

  function getMonthLabel(month: string) {
    const monthLabel = months.find((m) => parseInt(m.id) === parseInt(month))
    return monthLabel ? monthLabel.title.toLowerCase() : ''
  }

  // Some calculators have defaultMonthValue = '90' for yearly average
  function getResultPeriod(year: string, month: string, defaultMonthValue?: string) {
    return month === (defaultMonthValue ?? '') ? year : `${getMonthLabel(month)} ${year}`
  }

  function getResultQuartalPeriod(quartal: string, year: string) {
    return `${calculatorNextQuartalPeriodText.replaceAll('{0}', getQuartalNumber(quartal))} ${year}`
  }

  return {
    states: {
      loading,
      errorMessage,
      startPeriod,
      startYear,
      endPeriod,
      endYear,
      startValue,
      change,
      endValue,
      startResultPeriod,
      endResultPeriod,
      startValueResult,
      startIndex,
      endIndex,
    },
    setters: {
      setLoading,
      setErrorMessage,
      setChange,
      setEndValue,
      setStartResultPeriod,
      setEndResultPeriod,
      setStartValueResult,
      setStartIndex,
      setEndIndex,
      onChange,
    },
    validation: {
      onBlur,
      isStartValueValid,
      isStartYearValid,
      isEndYearValid,
      isStartPeriodValid,
      isEndPeriodValid,
    },
    scrollAnchor,
    onSubmitBtnElement,
    getResultPeriod,
    getResultQuartalPeriod,
    closeResult,
  }
}
