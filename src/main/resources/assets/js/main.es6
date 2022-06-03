import { init as initHighcharts } from './app/highchart.es6'
import { init as initMap } from './app/map.es6'
import { init as initMenuDropDown } from './app/menuDropdown.es6'
import { init as initDivider } from './app/divider.es6'
import { init as initTableExport } from './app/tableExport.es6'

document.addEventListener('DOMContentLoaded', () => {
  initHighcharts()
  initMap()
  initMenuDropDown()
  initDivider()
  initTableExport()
}, false)
