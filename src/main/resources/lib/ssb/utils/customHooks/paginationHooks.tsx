import { useCallback, useEffect, useRef, useState } from 'react'

interface UsePaginationProps<T> {
  list: T[]
  listItemsPerPage: number
  loading?: boolean
  onLoadMore: () => void
  onLoadFirst?: () => void
  totalCount?: number
}

// TODO: This function may no longer need to be exported after all pagination has been updated; prefer using handleKeyboardNavigation function from usePagination in components instead
export const usePaginationKeyboardNavigation = (callback: () => void) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  }
  return handleKeyDown
}

export const usePagination = <T,>({
  list,
  listItemsPerPage,
  loading,
  onLoadMore,
  onLoadFirst,
  totalCount,
}: UsePaginationProps<T>) => {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const currentElement = useRef<HTMLLIElement>(null)
  const prevListLength = useRef(0)

  const showLess = totalCount === list.length
  const hideBtn = (totalCount as number) < listItemsPerPage

  // TODO: Will no longer be needed once it's been replaced by show less button in all components
  const disableBtn = loading || showLess

  useEffect(() => {
    if (keyboardNavigation && list.length > prevListLength.current) {
      currentElement.current?.focus()
    }
    prevListLength.current = list.length
  }, [list, keyboardNavigation])

  const getCurrentElementRef = useCallback(
    (index: number) => {
      return index === prevListLength.current ? currentElement : null
    },
    [keyboardNavigation, list.length]
  )

  const handleKeyboardNavigation = usePaginationKeyboardNavigation(() => {
    setKeyboardNavigation(true)
    if (showLess && onLoadFirst) {
      onLoadFirst()
    } else {
      onLoadMore()
    }
  })

  const handleOnClick = () => {
    setKeyboardNavigation(false)
    if (showLess && onLoadFirst) {
      onLoadFirst()
    } else {
      onLoadMore()
    }
  }

  return {
    disableBtn,
    hideBtn,
    showLess,
    getCurrentElementRef,
    handleKeyboardNavigation,
    handleOnClick,
  }
}
