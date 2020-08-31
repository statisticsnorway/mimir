import $ from 'jquery'
// import 'file-saver'
// import 'tableexport.jquery.plugin'

export function init() {
  $(function() {
    $('#downloadCSV').click((e) => {
      e.preventDefault()

      /* $('table').tableExport({
        type: 'csv',
        csvSeparator: ';'
      })*/
    })
  })
}

