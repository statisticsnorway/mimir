import { HttpLibrary, HttpResponse } from 'enonic-types/lib/http'
import { XmlParser } from '../../types/xmlParser'
import { QueryFilters } from '../../repo/common'
import { extractStatistics, Statistic } from './types'
import { STATISTICS_URL } from './config'

const xmlParser: XmlParser = __.newBean('no.ssb.xmlparser.XmlParser')
const http: HttpLibrary = __non_webpack_require__('/lib/http-client')


