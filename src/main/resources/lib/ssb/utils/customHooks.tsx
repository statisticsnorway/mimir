import { useEffect, useRef, useState } from 'react'

interface UseKeyboardNavigationFocusProps<T> {
  onLoadMore: () => void
  list: T[]
  listItemsPerPage: number
}

export const useBtnKeyboardNavigation = (callback: () => void) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  }
  return handleKeyDown
}

export const useBtnKeyboardNavigationFocus = <T,>({
  onLoadMore,
  list,
  listItemsPerPage,
}: UseKeyboardNavigationFocusProps<T>) => {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const currentElement = useRef<HTMLLIElement>(null)

  useEffect(() => {
    if (keyboardNavigation) {
      currentElement.current?.focus()
    }
  }, [list])

  const handleKeyboardNavigation = useBtnKeyboardNavigation(() => {
    setKeyboardNavigation(true)
    onLoadMore()
  })

  const getCurrentElementRef = (index: number) => {
    return index === list.length - listItemsPerPage ? currentElement : null
  }

  return {
    handleKeyboardNavigation,
    getCurrentElementRef,
    setKeyboardNavigation,
  }
}
