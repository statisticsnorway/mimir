import $ from 'jquery'
import 'tableexport.jquery.plugin/libs/FileSaver/FileSaver.min.js'
import 'tableexport.jquery.plugin/tableExport.min.js'

export function init() {
  $(function() {
    $('#downloadTableAsCSV').click((e) => {
      e.preventDefault()

      $('table').tableExport({
        type: 'csv',
        csvSeparator: ';'
      })
    })
  })
}

