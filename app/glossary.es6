// Adds Popper popups for glossary

$(function() {
  $('body').click((e) => $('.popper').addClass('d-none'))
  $('.popper .btn-close').click((e) => $('.popper').addClass('d-none'))
  $('div[id^="glossary-"]').each((i, el) => {
    const href = $(el).attr('data-href')
     $(`a[href='${href}']`).each((i, a) => {
       $(a).attr('aria-describedby', el.id)
       $(a).addClass('a-glossary')
       $(a).click((e) => {
         e.preventDefault()
         e.stopPropagation()
         $(el).toggleClass('d-none')
         const popper = new Popper(a, el, { placement: 'bottom' })
       })
     })
  })
})
