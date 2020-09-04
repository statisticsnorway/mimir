import '../jquery-global.js'
import 'tableexport.jquery.plugin/libs/FileSaver/FileSaver.min.js'
import 'tableexport.jquery.plugin/tableExport.min.js'

export function init() {
  $(function() {
    $(window).resize(function() {
      moveDownloadTableDropdown()
    })

    $('#downloadTableAsCSV').click((e) => {
      e.preventDefault()
      tableExport()
    })
  })

  function moveDownloadTableDropdown() {
    if ($(window).width() <= 768) {
      $('.download-table-container').insertAfter('table')
    } else {
      $('.download-table-container').insertBefore('table')
    }
  }

  function tableExport() {
    const closestTable = $('table').closest('.container')
    closestTable.tableExport({
      type: 'csv',
      fileName: 'tabell',
      csvSeparator: ';'
    })
  }
}

