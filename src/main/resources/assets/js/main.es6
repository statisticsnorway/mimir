import { init as initAutocomplete } from './app/autocomplete.es6'
import { init as initHeader } from './app/header.es6'
// import { init as initHighcharts } from './app/highchart.es6'
import { init as initMap } from './app/map.es6'
import { init as initMenuDropDown } from './app/menuDropdown.es6'
import { init as initPrint } from './app/print.es6'
import { init as initRelatedKostra } from './app/relatedKostra.es6'
import { init as initDivider } from './app/divider.es6'
import { init as initTableExport } from './app/tableExport.es6'

document.addEventListener('DOMContentLoaded', () => {
  initAutocomplete()
  initHeader()
  // initHighcharts()
  initMap()
  initMenuDropDown()
  initPrint()
  initRelatedKostra()
  initDivider()
  initTableExport()
}, false)
