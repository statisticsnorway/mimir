import { useEffect, useRef, useState } from 'react'

interface UseKeyboardNavigationFocusProps<T> {
  onLoadMore: () => void
  list: T[]
  listItemsPerPage: number
  totalCount?: number
  loading?: boolean
  cardList?: boolean
}

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
  onLoadMore,
  list,
  listItemsPerPage,
  totalCount,
  loading,
  cardList,
}: UseKeyboardNavigationFocusProps<T>) => {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const currentElement = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (keyboardNavigation) {
      currentElement.current?.focus()
    }
  }, [list])

  const handleKeyboardNavigation = usePaginationKeyboardNavigation(() => {
    setKeyboardNavigation(true)
    onLoadMore()
  })

  const getCurrentElementRef = (index: number) => {
    if (cardList) {
      return index === listItemsPerPage ? currentElement : null
    }
    return index === list.length - listItemsPerPage ? currentElement : null
  }

  const disableBtn = loading || totalCount === list.length

  return {
    handleKeyboardNavigation,
    getCurrentElementRef,
    setKeyboardNavigation,
    disableBtn,
  }
}
