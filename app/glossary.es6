// Adds Popper popups for glossary

$(function() {
  let elements = {}
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
      $(a).attr('aria-describedby', el.id).addClass('a-glossary').click((e) => {
        e.preventDefault()
        e.stopPropagation()
        $(el).toggleClass('d-none')
        const popper = new Popper(a, el, { placement: 'bottom' })
      })
    })
  })
})
