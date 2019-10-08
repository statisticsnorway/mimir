// Adds language tooltip to language switcher if page don't exist (provided by attribute data-exists)
$(function() {
  // Bind popper to language switch menu item
  $('#change-language').each((i, el) => {
    if ($(el).attr('data-exists') === 'false') {
      $(el).click((e) => {
        e.preventDefault()
        const tooltip = $('#language-tooltip')
        tooltip.find('.btn-close').click((e) => $('#language-tooltip').addClass('d-none'))
        if (tooltip.hasClass('d-none')) {
          tooltip.removeClass('d-none')
          popper = new Popper(document.getElementById('change-language'), document.getElementById('language-tooltip'), {
            placement: 'bottom'
          })
        }
        else {
          tooltip.addClass('d-none')
        }
      })
    }
  })
})
