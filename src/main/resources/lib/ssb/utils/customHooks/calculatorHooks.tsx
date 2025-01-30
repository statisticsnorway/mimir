import { useEffect, useRef, useState } from 'react'
import { type DropdownItem, type DropdownItems } from '/lib/types/components'

interface UseSetupCalculatorProps {
  calculatorValidateAmountNumber?: string
  defaultMonthValue?: DropdownItem
  defaultMonthErrorMsg?: string
  lastNumberText: string
  validYearErrorMsg: string
  validMaxYear: string | number
  validMaxMonth: string | number
  validMinYear: number
  months: DropdownItems
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
  validYearErrorMsg,
  validMaxYear,
  validMaxMonth,
  validMinYear,
  months,
}: UseSetupCalculatorProps) => {
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
    const startMonthValid = !(startYear.value === validMaxYear && startMonthValue > validMaxMonth)
    if (!startMonthValid) {
      setStartMonth({
        ...startMonth,
        error: true,
      })
    }
    return startMonthValid
  }

  function isEndMonthValid(value?: string) {
    const endMonthValue = value || (endMonth.value as DropdownItem).id
    const maxYearAverage = Number(validMaxMonth) === 12 ? validMaxYear : Number(validMaxYear) - 1
    const endMonthValid =
      endMonthValue === '90'
        ? (endYear.value as string) <= maxYearAverage
        : !(endYear.value === validMaxYear && endMonthValue > validMaxMonth)
    if (!endMonthValid) {
      setEndMonth({
        ...endMonth,
        error: true,
      })
    }
    return endMonthValid
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

  function onChange(id: string, value: CalculatorState['value']) {
    switch (id) {
      case 'start-value': {
        value = (value as string).replace(/,/g, '.')
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
          error: startMonth.error ? !isStartMonthValid((value as DropdownItem)?.id as string) : startMonth.error,
          errorMsg: (value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
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
          error: startYear.error ? !isStartYearValid(value as string) : startYear.error,
        })
        break
      }
      case 'end-month': {
        setEndMonth({
          ...endMonth,
          value,
          error: endMonth.error ? !isEndMonthValid((value as DropdownItem)?.id) : endMonth.error,
          errorMsg: (value as DropdownItem)?.id !== '' ? lastNumberText : defaultMonthErrorMsg,
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
          error: endYear.error ? !isEndYearValid(value as string) : endYear.error,
        })
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

  function getQuartalPeriod(year: string, quartal: string) {
    return `${year} ${quartal}`
  }

  return {
    states: {
      startValue,
      startMonth,
      startYear,
      endMonth,
      endYear,
      errorMessage,
      loading,
      change,
      endValue,
      startPeriod,
      endPeriod,
      startValueResult,
      startIndex,
      endIndex,
    },
    setters: {
      setStartValue,
      setStartMonth,
      setStartYear,
      setEndMonth,
      setEndYear,
      setErrorMessage,
      setLoading,
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
      isStartYearValid,
      isEndYearValid,
      isStartMonthValid,
      isEndMonthValid,
      onBlur,
    },
    scrollAnchor,
    onSubmitBtnElement,
    getPeriod,
    getQuartalPeriod,
    closeResult,
  }
}
