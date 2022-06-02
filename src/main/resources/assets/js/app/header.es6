import $ from 'jquery'
import Popper from 'popper.js'

// Adds language tooltip to language switcher if page don't exist (provided by attribute data-exists)
export function init() {
  $(function() {
    // Bind popper to language switch menu item
    $('#change-language').each((i, el) => {
      console.log('change language')
      if ($(el).attr('data-exists') === 'false') {
        console.log('data-exists false')
        $(el).click((e) => {
          e.preventDefault()
          e.stopPropagation()
          const tooltip = $('#language-tooltip')
          if (tooltip.hasClass('d-none')) {
            console.log('d-none')
            tooltip.removeClass('d-none')
            new Popper(document.getElementById('change-language'),
              document.getElementById('language-tooltip'),
              {
                placement: 'bottom'
              })
          } else {
            tooltip.addClass('d-none')
          }
        })
      }
    })

    $('header input').keyup(function(e) {
      e.which === 13 ? $('header .input-wrapper button').click() : ''
    })
  })
}
