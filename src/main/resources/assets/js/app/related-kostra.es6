import $ from 'jquery';

export function init() {
  $(function() {
    $('.part-related-kostra').find('a').not('.btn-related-kostra').addClass('ssb-link')
    $('.part-related-kostra').find('.btn-related-kostra').addClass('ssb-btn primary-btn')
  })
}
