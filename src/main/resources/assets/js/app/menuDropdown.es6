import $ from 'jquery'
import 'bootstrap/js/dist/collapse'
// Markup according to Bootstrap 4 collapse element - see https://getbootstrap.com/docs/4.3/components/collapse/
// Dependencies: jQuery and Bootstrap
// Belongs to part menu-dropdown
// - adds visibility class for muncipality when on top of page (sticky part of page)
export function init() {
  $(function() {
    let animate
    const map = $('#js-show-map')

    map.on('show.bs.collapse', () => {
      map.parent().addClass('map-container')

      if (window.innerWidth <= 720) { // Bootstrap md width
        $('#search-container').collapse('hide')
      }

      $('.show-search').parent().click(() => {
        map.collapse('hide')
      })
    })

    /* TODO: look into: animation for feather-icon down not animating + background when element is being 'pulled back' is not transparent */
    map.on('shown.bs.collapse', () => {
      const el = $('.part-menu-dropdown')[0]

      const {
        top
      } = el.getBoundingClientRect()

      if (top > 1) {
        animate = true

        const pos = $(el).offset()
        $('html').stop().animate({
          scrollTop: pos.top
        }, 400, 'swing', () => {
          animate = false
          setTimeout(() => {
            map.collapse('show')
          }, 50)
        })
      }
    })

    map.on('hide.bs.collapse', () => {
      map.parent().removeClass('map-container')
    })

    $('.part-menu-dropdown').each((i, el) => {
      $(window).scroll(() => {
        const {
          top
        } = el.getBoundingClientRect()

        top > 0 && $(el).removeClass('border-bottom shadow-sm').find('.opacity-zero')
          .removeClass('opacity-one')

        top === 0 && $(el).addClass('border-bottom shadow-sm').find('.opacity-zero')
          .addClass('opacity-one')

        top > 0 &&
        !animate &&
        map.length &&
        map.collapse('hide')

        const stickyMenu = document.getElementById('sticky-menu')
        if (stickyMenu) {
          const boundingRect = stickyMenu.getBoundingClientRect()
          const stickyTop = boundingRect.top
          if (stickyTop < 0) {
            stickyMenu.style.height = `${boundingRect.height}px`
            $(el).addClass('fixed-top')
          } else if (stickyTop > 0) {
            stickyMenu.style.height = null
            $(el).removeClass('fixed-top')
          }
        }
      })
    })

    $('#input-query-municipality').focus(() => {
      const mode = $('.show-search').data('mode')
      if (mode) {
        map.collapse('hide') // Hide map when municipality search field active on smaller than md
      }
    })

    $('#search-container').on('shown.bs.collapse', (e) => {
      const mode = $(e.currentTarget).data('mode')
      if (mode) {
        map.collapse('hide')// Hide map when municipality search button clicked
      }
    })

    if (window.innerWidth >= 960) { // Bootstrap lg grid
      $('#search-container').collapse('show')
    } else {
      $('#search-container').collapse('hide') /* TODO: hides from Kommunefakta (municipality not selected) also */
    }

    $('#input-query-municipality').attr({
      'data-display': 'static',
      'data-toggle': 'dropdown',
      'role': 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false'
    })

    $('#municipality-list').appendTo('.input-wrapper')
  })
}
