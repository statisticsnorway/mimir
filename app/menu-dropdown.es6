// Belongs to part menu-dropdown
// - adds visibility class for muncipality when on top of page (sticky part of page)
$(function() {
  $('.part-menu-dropdown').each((i, el) => {
    $(window).scroll((e) => {
      const { top } = el.getBoundingClientRect()
      top > 0 && $(el).removeClass('border-bottom shadow-sm').find('.opacity-zero').removeClass('opacity-one')
      top === 0 && $(el).addClass('border-bottom shadow-sm').find('.opacity-zero').addClass('opacity-one')
    })
  })
})
