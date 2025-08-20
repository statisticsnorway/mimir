import { useEffect, useRef, useState } from 'react'

interface UsePaginationProps<T> {
  list: T[]
  listItemsPerPage: number
  loading?: boolean
  onLoadMore: () => void
  onLoadFirst?: () => void
  totalCount?: number
  scrollIntoView?: boolean
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
  scrollIntoView,
}: UsePaginationProps<T>) => {
  const [keyboardNavigation, setKeyboardNavigation] = useState(false)
  const currentElement = useRef<HTMLLIElement>(null)
  const prevListLength = useRef(0)
  const scrollAnchor = React.useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (scrollIntoView && scrollAnchor.current) {
      scrollAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
    }
  }, [scrollIntoView])

  const getCurrentElementRef = (index: number) => {
    return index === prevListLength.current ? currentElement : null
  }

  const fetchListItems = () => {
    if (showLess && onLoadFirst) {
      onLoadFirst()
    } else {
      onLoadMore()
    }
  }

  const handleKeyboardNavigation = usePaginationKeyboardNavigation(() => {
    setKeyboardNavigation(true)
    fetchListItems()
  })

  const handleOnClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.blur() // Remove focus from the button
    setKeyboardNavigation(false)
    fetchListItems()
  }

  return {
    disableBtn,
    hideBtn,
    showLess,
    scrollAnchor,
    getCurrentElementRef,
    handleKeyboardNavigation,
    handleOnClick,
  }
}
