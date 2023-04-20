// Only used in menuDropdown part

import $ from 'jquery'
import 'bootstrap/js/dist/collapse'

// Markup according to Bootstrap 4 collapse element - see https://getbootstrap.com/docs/4.3/components/collapse/
// Dependencies: jQuery and Bootstrap
// Belongs to part menu-dropdown
// - adds visibility class for muncipality when on top of page (sticky part of page)
function init() {
  $(function () {
    let animate
    const map = $('#js-show-map')

    $('.show-map').on('click', (e) => {
      e.preventDefault()
      e.stopPropagation()

      const el = $('.part-menu-dropdown')[0]

      const { top } = el.getBoundingClientRect()

      const onSwingTimeout = () => {
        map.collapse('show')
      }

      if (top > 1) {
        animate = true

        const pos = $(el).offset()
        $('html')
          .stop()
          .animate(
            {
              scrollTop: pos.top,
            },
            400,
            'swing',
            () => {
              animate = false
              setTimeout(onSwingTimeout, 50)
            }
          )
      }
    })

    map.on('show.bs.collapse', () => {
      map.parent().addClass('map-container')
      $('.show-map').attr('aria-expanded', 'true').addClass('active')

      if (window.innerWidth <= 720) {
        // Bootstrap md width
        $('#search-container').collapse('hide')
        $('.show-search').removeClass('active')
      }

      $('.show-search')
        .parent()
        .on('click', () => {
          $('.show-map').removeClass('active')
        })
    })

    map.on('hide.bs.collapse', () => {
      map.parent().removeClass('map-container')
      $('.show-map').attr('aria-expanded', 'false').removeClass('active')
      map.css('transition', 'none')
    })

    $('.part-menu-dropdown').each((i, el) => {
      $(window).on('scroll', () => {
        const { top } = el.getBoundingClientRect()

        top > 0 && $(el).removeClass('border-bottom shadow-sm').find('.opacity-zero').removeClass('opacity-one')

        top === 0 && $(el).addClass('border-bottom shadow-sm').find('.opacity-zero').addClass('opacity-one')

        top > 0 && !animate && map.length

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

    $('#search-container').on('show.bs.collapse', () => {
      $('#search-container').removeClass('hide-search')
      $('.show-search').addClass('active')
      $('.show-map').attr('aria-expanded', 'false').removeClass('active')
    })

    $('#search-container').on('hide.bs.collapse', () => {
      $('.show-search').removeClass('active')
    })

    $('#input-query-municipality').attr({
      'data-display': 'static',
      'data-toggle': 'dropdown',
      role: 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false',
    })

    $('#municipality-list').appendTo('.input-wrapper')
  })
}

document.addEventListener('DOMContentLoaded', () => init(), false)
