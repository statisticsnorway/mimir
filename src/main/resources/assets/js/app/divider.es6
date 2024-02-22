// Used by divider and article parts. Only inlcude where they are used.

function init() {
  const isHidden = (elem) => {
    return window.getComputedStyle(elem).getPropertyValue('display') === 'none'
  }

  // Removes unused empty paragraph tags. They appear to be injected before and after each macro, for some reason.
  const empty = document.querySelectorAll('p:empty')
  if (empty) empty.forEach((elem) => elem.remove())

  // #region hide trailing dividers in last region
  const sectionsInLastRegion = Array.from(document.querySelectorAll('.xp-region:last-child > section'))
  sectionsInLastRegion.reverse().every((elem) => {
    if (isHidden(elem)) {
      return true // skip all hidden sections at the end of the region
    } else if (elem.classList.contains('part-divider')) {
      elem.style.display = 'none' // hide all trailing dividers in the last region
      return true
    } else {
      return false // we're all good, stop looping
    }
  })
  // #endregion

  // #region hide trailing dividers in article-body
  const articleBody = document.querySelector('.article-body')
  if (articleBody) {
    const articleBodyChildren = Array.from(articleBody.children)
    articleBodyChildren.reverse().every((elem) => {
      if (elem.tagName === 'P') {
        if (elem.innerText === '') {
          elem.style.display = 'none' // hide all trailing paragraphs in article-body
          return true
        } else {
          return false // last element is a paragraph with text, and we're all good
        }
      } else if (elem.classList.contains('part-divider')) {
        elem.style.display = 'none' // hide all trailing dividers in article-body
        return true
      } else {
        return false // last elem is not an
      }
    })
  }
  // #endregion
}

document.addEventListener('DOMContentLoaded', () => init(), false)
