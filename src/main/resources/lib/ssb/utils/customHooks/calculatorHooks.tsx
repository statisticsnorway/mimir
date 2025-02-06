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
  const [startMonth, setStartMonth] = useState<CalculatorState>({
    error: false,
    errorMsg: lastNumberText,
    value: defaultMonthValue,
  })

  const [startYear, setStartYear] = useState<CalculatorState>({
    error: false,
    errorMsg: validYearErrorMsg,
    value: '',
  })

  const [endMonth, setEndMonth] = useState<CalculatorState>({
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
  const [startPeriod, setStartPeriod] = useState<string | null>(null)
  const [endPeriod, setEndPeriod] = useState<string | null>(null)
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

  function isStartMonthValid(value?: string) {
    const startMonthValue = value || (startMonth.value as DropdownItem).id
    const isQuartalPeriod = startMonthValue !== '' && isNaN(Number(startMonthValue))
    const startMonthOrQuartalPeriodMonthValue = isQuartalPeriod
      ? (getMonthByQuartal(getQuartalNumber(startMonthValue)) as number)
      : startMonthValue

    const startMonthValid = !(startYear.value === validMaxYear && startMonthOrQuartalPeriodMonthValue > validMaxMonth)
    if (!startMonthValid) {
      setStartMonth((prevState) => ({
        ...prevState,
        error: true,
      }))
    }
    return startMonthValue === '' ? false : startMonthValid
  }

  function isEndMonthValid(value?: string) {
    const endMonthValue = value || (endMonth.value as DropdownItem).id
    const isQuartalPeriod = endMonthValue !== '' && isNaN(Number(endMonthValue))
    const endMonthOrQuartalPeriodMonthValue = isQuartalPeriod
      ? (getMonthByQuartal(getQuartalNumber(endMonthValue)) as number)
      : endMonthValue

    const maxYearAverage = Number(validMaxMonth) === 12 ? validMaxYear : Number(validMaxYear) - 1
    const endMonthValid =
      endMonthValue === '90'
        ? (endYear.value as string) <= maxYearAverage
        : !(endYear.value === validMaxYear && endMonthOrQuartalPeriodMonthValue > validMaxMonth)

    if (!endMonthValid) {
      setEndMonth((prevState) => ({
        ...prevState,
        error: true,
      }))
    }
    return endMonthValue === '' ? false : endMonthValid
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
      case 'start-month': {
        setStartMonth((prevState) => ({
          ...prevState,
          error: !isStartMonthValid(),
          errorMsg: (prevState.value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      case 'end-month': {
        setEndMonth((prevState) => ({
          ...prevState,
          error: !isEndMonthValid(),
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
      case 'start-month': {
        setStartMonth((prevState) => ({
          ...prevState,
          value,
          error: prevState.error ? !isStartMonthValid((value as DropdownItem)?.id as string) : prevState.error,
          errorMsg: (value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      case 'start-year': {
        if (startMonth.error) {
          setStartMonth((prevState) => ({
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
      case 'end-month': {
        setEndMonth((prevState) => ({
          ...prevState,
          value,
          error: prevState.error ? !isEndMonthValid((value as DropdownItem)?.id) : prevState.error,
          errorMsg: (value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
        }))
        break
      }
      case 'end-year': {
        if (endMonth.error) {
          setEndMonth((prevState) => ({
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
  function getPeriod(year: string, month: string, defaultMonthValue?: string) {
    return month === (defaultMonthValue ?? '') ? year : `${getMonthLabel(month)} ${year}`
  }

  function getQuartalPeriod(quartal: string, year: string) {
    return `${calculatorNextQuartalPeriodText.replaceAll('{0}', getQuartalNumber(quartal))} ${year}`
  }

  return {
    states: {
      loading,
      errorMessage,
      startMonth,
      startYear,
      endMonth,
      endYear,
      startValue,
      change,
      endValue,
      startPeriod,
      endPeriod,
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
    validation: {
      onBlur,
      isStartValueValid,
      isStartYearValid,
      isEndYearValid,
      isStartMonthValid,
      isEndMonthValid,
    },
    scrollAnchor,
    onSubmitBtnElement,
    getPeriod,
    getQuartalPeriod,
    closeResult,
  }
}
