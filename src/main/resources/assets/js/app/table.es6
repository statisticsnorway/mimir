import $ from 'jquery'

export function init() {
  $(function() {
    $(window).resize(function() {
      moveDownloadTableDropdown()
    })
  })

  function moveDownloadTableDropdown() {
    if ($(window).width() <= 768) {
      $('.download-table-container').insertAfter('table')
    } else {
      $('.download-table-container').insertBefore('table')
    }
  }
}
