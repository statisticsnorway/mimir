$(function() {
  $('input[autocomplete]').each((i, el) => {
    const dropdown = $(el).parent().find('.dropdown-menu')
    dropdown.css('max-width', $(el).outerWidth())
    const elements = dropdown.find('a')
    $(window).resize(() => dropdown.css('max-width', $(el).outerWidth()))
    $(el).keyup((e) => {
      const val = $(el).val()
      const re = new RegExp($(el).val(), 'i')
      val.length && dropdown.addClass('show')
      elements.each((j, a) => {
        a.classList.add('d-none')
        a.getAttribute('data-text').match(re) && a.classList.remove('d-none')
        // $(a).toggleClass('d-none', a.innerHTML.match(re))
      })
      dropdown.toggleClass('show', dropdown.find('a:not(.d-none)').length > 0)
    })
  })
})
