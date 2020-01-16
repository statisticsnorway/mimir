import '../styles/main.scss'

import { init as initAutocomplete } from './app/autocomplete.es6'
import { init as initBanner } from './app/banner.es6'
import { init as initDashboard } from './app/dashboard.es6'
import { init as initGloassary } from './app/glossary.es6'
import { init as initHeader } from './app/header.es6'
import { init as initHighcharts } from './app/highchart.es6'
import { init as initMap } from './app/map.es6'
import { init as initMenu } from './app/menu.es6'
import { init as initMenuDropDown } from './app/menu-dropdown.es6'
import { init as initPrint } from './app/print.es6'


document.addEventListener('DOMContentLoaded', () => {
  initAutocomplete()
  initBanner()
  initDashboard()
  initGloassary()
  initHeader()
  initHighcharts()
  initMap()
  initMenu()
  initMenuDropDown()
  initPrint()
}, false)
