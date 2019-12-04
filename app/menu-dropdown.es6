// Belongs to part menu-dropdown
// - adds visibility class for muncipality when on top of page (sticky part of page)
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
    const { top } = el.getBoundingClientRect()
    $(e.target).toggleClass('active')
    map.parent().click(() => {
      map.addClass('d-none').parent().removeClass('map-container')
    })
    if (map.hasClass('d-none')) {
      if (top > 1) {
        animate = true
        const pos = $(el).offset()
        $('html').stop().animate({ scrollTop: pos.top }, 400, 'swing', () => {
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
      const { top } = el.getBoundingClientRect()
      top > 0 && $(el).removeClass('border-bottom shadow-sm').find('.opacity-zero').removeClass('opacity-one')
      top === 0 && $(el).addClass('border-bottom shadow-sm').find('.opacity-zero').addClass('opacity-one')
      top > 0 && !animate && $('.map-container').length && map.addClass('d-none').parent().removeClass('map-container') && $('#js-show-map').removeClass('active')
    })
  })
})
