import $ from 'jquery'

// Belongs to part menu-dropdown
// - adds visibility class for muncipality when on top of page (sticky part of page)
export function init() {
  $(function() {
    let animate
    const map = $('.js-part-map')
    map.click((e) => {
      e.preventDefault()
      e.stopPropagation()
    })
    $('#js-show-map').click((e) => {
      e.preventDefault()
      e.stopPropagation()
      const el = $('.part-menu-dropdown')[0]
      const {
        top
      } = el.getBoundingClientRect()
      $('#municipality-list').removeClass('show')
      $(e.currentTarget).toggleClass('active')
      $('.show-search').attr('aria-expanded', 'false')
      window.innerWidth < 960 && $('#search-container').removeClass('show')
      map.parent().click(() => {
        map.addClass('d-none').parent().removeClass('map-container')
      })
      if (map.hasClass('d-none')) {
        if (top > 1) {
          animate = true
          const pos = $(el).offset()
          $('html').stop().animate({
            scrollTop: pos.top
          }, 400, 'swing', () => {
            animate = false
            setTimeout(() => {
              map.removeClass('d-none').parent().addClass('map-container')
            }, 50)
          })
        } else {
          map.toggleClass('d-none').parent().toggleClass('map-container')
        }
      } else {
        map.toggleClass('d-none').parent().toggleClass('map-container')
      }
    })
    $('.part-menu-dropdown').each((i, el) => {
      $(window).scroll((e) => {
        const {
          top
        } = el.getBoundingClientRect()
        top > 0 && $(el).removeClass('border-bottom shadow-sm').find('.opacity-zero')
          .removeClass('opacity-one')
        top === 0 && $(el).addClass('border-bottom shadow-sm').find('.opacity-zero')
          .addClass('opacity-one')
        top > 0 &&
          !animate &&
          $('.map-container').length &&
          map.addClass('d-none').parent().removeClass('map-container') &&
          $('#js-show-map').removeClass('active')

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

    $('#input-query-municipality').focus((e) => {
      const mode = $('.show-search').data('mode')
      if (mode === 'municipality') {
        $('.js-part-map').addClass('d-none').parent()
          .removeClass('map-container') // Remove map when municipality search field active on smaller than md
      }
    })
    $('.show-search').click((e) => {
      const mode = $(e.currentTarget).data('mode')
      if (mode == 'municipality') {
        $('#js-show-map').removeClass('active')
        $('.js-part-map').addClass('d-none').parent()
          .removeClass('map-container') // Remove map when municipality search button clicked
      }
    })
    const w = window.innerWidth
    if (w >= 960) { // Bootstrap lg grid
      $('#search-container').addClass('show')
    }
  })
}
