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

    map.on('shown.bs.collapse', (e) => {
      $('.show-map').toggleClass('active') // Styles map icon when map is shown

      $('#search-container').collapse('hide')
      $('.show-search').removeClass('active')

      window.innerWidth < 960 && $('#search-container').removeClass('show')

      $('.show-search').parent().click(() => {
        map.collapse('hide')
      })

      const el = $('.part-menu-dropdown')[0]

      const {
        top
      } = el.getBoundingClientRect()

      /* TODO: look at the original code and check functionality (previously nested in if-test if map has class d-none) */
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

    map.on('hidden.bs.collapse', () => {
      $('.show-map').removeClass('active')
    })

    $('.part-menu-dropdown').each((i, el) => {
      /* TODO: Kommunefakta search-container styling not working (show-search has a data-th-if=modeMunicipality ?) */
      const mode = $('.show-search').data('mode')
      if (mode === 'municipality') {
        if (window.innerWidth <= 768) { // Bootstrap md grid
          $('#search-container').css({
            'border-style': 'hidden'
          })
        }
      }

      $(window).scroll(() => {
        const {
          top
        } = el.getBoundingClientRect()

        top > 0 && $(el).removeClass('border-bottom shadow-sm').find('.opacity-zero')
          .removeClass('opacity-one')

        top === 0 && $(el).addClass('border-bottom shadow-sm').find('.opacity-zero')
          .addClass('opacity-one')

        /* TODO: look into */
        /*top > 0 &&
        !animate &&
        $('#js-show-map').length &&
        $('#js-show-map').collapse('hide') &&
        $('#js-show-map').removeClass('active')*/

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
      if (mode === 'municipality') {
        $('#js-show-map').collapse('hide') // Hide map when municipality search field active on smaller than md
      }
    })

    $('.show-search').click((e) => {
      $(e.currentTarget).toggleClass('active') // Styles search icon after button is pressed

      const mode = $(e.currentTarget).data('mode')
      if (mode == 'municipality') {
        $('.show-map').removeClass('active')
        $('#js-show-map').collapse('hide')// Hide map when municipality search button clicked
      }
    })

    if (window.innerWidth >= 960) { // Bootstrap lg grid
      $('#search-container').addClass('show')
    } else {
      $('#search-container').removeClass('show')
    }

    // Adds attributes into the component input field
    $('#input-query-municipality').attr({
      'data-display': 'static',
      'data-toggle': 'dropdown',
      'role': 'button',
      'aria-haspopup': 'true',
      'aria-expanded': 'false'
    })

    // Moves municipality-list inside the same wrapper as the input field
    $('#municipality-list').appendTo('.input-wrapper')
  })
}
