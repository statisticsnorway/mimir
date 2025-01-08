import { useEffect, useRef, useState } from 'react'

interface UsePaginationProps<T> {
  cardList?: boolean
  list: T[]
  listItemsPerPage: number
  loading?: boolean
  onLoadMore: () => void
  totalCount?: number
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
  cardList,
  list,
  listItemsPerPage,
  loading,
  onLoadMore,
  totalCount,
}: UsePaginationProps<T>) => {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const currentElement = useRef<HTMLLIElement>(null)

  const disableBtn = loading || totalCount === list.length

  useEffect(() => {
    if (keyboardNavigation) {
      currentElement.current?.focus()
    }
  }, [list])

  const getCurrentElementRef = (index: number) => {
    if (cardList) {
      return index === listItemsPerPage ? currentElement : null
    }
    return index === list.length - listItemsPerPage ? currentElement : null
  }

  const handleKeyboardNavigation = usePaginationKeyboardNavigation(() => {
    setKeyboardNavigation(true)
    onLoadMore()
  })

  const handleOnClick = () => {
    setKeyboardNavigation(false)
    onLoadMore()
  }

  return {
    disableBtn,
    getCurrentElementRef,
    handleKeyboardNavigation,
    handleOnClick,
  }
}
