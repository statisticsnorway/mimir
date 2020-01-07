import $ from 'jquery';

export function init() {
  $(function() {
      $('.part-related-kostra a').addClass('ssb-link')
      $('.part-related-kostra .btn-related-kostra-link').addClass('text-decoration-none').removeClass('ssb-link')
  })
}
