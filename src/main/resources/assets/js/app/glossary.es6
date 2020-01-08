import $ from 'jquery'
import Popper from 'popper.js'

export function init () {
  $(function () {
    const elements = {}
    $('body').click((e) => $('.popper').addClass('d-none'))
    $('.popper .btn-close').click((e) => $('.popper').addClass('d-none'))
    $('div[id^="glossary-"]').each((i, el) => {
      if (elements[el.id]) {
        $(el).remove() // remove duplicates
        return
      }
      elements[el.id] = true
      const href = $(el).attr('data-href')
      $(`a[href='${href}']`).each((i, a) => {
        $(a).attr('aria-describedby', el.id).addClass('a-glossary ssb-word-explanation').click((e) => {
          e.preventDefault()
          e.stopPropagation()
          $(el).toggleClass('d-none')
          new Popper(a, el, { placement: 'bottom' })
        })
      })
    })
  })
}
