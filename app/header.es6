$(function() {
console.log('Running header!')
  // Bind popper to language switch menu item
  $('#change-language').each((i, el) => {
    $(el).click((e) => {
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
  })
})
