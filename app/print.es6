// Bind click event to print button
$(function() {
  $('#share-print').click((e) => {
    e.preventDefault()
    window.print()
  })
})
