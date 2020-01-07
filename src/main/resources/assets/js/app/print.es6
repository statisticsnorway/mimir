import $ from 'jquery'

// Bind click event to print button
export function init() {
  $(function() {
    $('#share-print').click((e) => {
      e.preventDefault()
      window.print()
    })
  })
}
