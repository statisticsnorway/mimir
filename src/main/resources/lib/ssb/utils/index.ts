import { AlertUtilsLib } from './alertUtils'
import { ArrayUtilsLib } from './arrayUtils'
import { BreadcrumbsUtilsLib } from './breadcrumbsUtils'
import { DateUtilsLib } from './dateUtils'
import { ImageUtilsLib } from './imageUtils'
import { ParentUtilsLib } from './parentUtils'
import { ServerLogLib } from './serverLog'
import { SolrUtilsLib } from './solrUtils'
import { SubjectUtilsLib } from './subjectUtils'
import { TextUtilsLib } from './textUtils'
import { UtilsLib } from './utils'
import { VariantUtilsLib } from './variantUtils'

export const alertUtils: AlertUtilsLib = __non_webpack_require__('/lib/ssb/utils/alertUtils')
export const arrayUtils: ArrayUtilsLib = __non_webpack_require__('/lib/ssb/utils/arrayUtils')
export const breadcrumbsUtils: BreadcrumbsUtilsLib = __non_webpack_require__('/lib/ssb/utils/breadcrumbsUtils')
export const dateUtils: DateUtilsLib = __non_webpack_require__('/lib/ssb/utils/dateUtils')
export const imageUtils: ImageUtilsLib = __non_webpack_require__('/lib/ssb/utils/imageUtils')
export const parentUtils: ParentUtilsLib = __non_webpack_require__('/lib/ssb/utils/parentUtils')
export const serverLog: ServerLogLib = __non_webpack_require__('/lib/ssb/utils/serverLog')
export const solrUtils: SolrUtilsLib = __non_webpack_require__('/lib/ssb/utils/solrUtils')
export const subjectUtils: SubjectUtilsLib = __non_webpack_require__('/lib/ssb/utils/subjectUtils')
export const textUtils: TextUtilsLib = __non_webpack_require__('/lib/ssb/utils/textUtils')
export const utils: UtilsLib = __non_webpack_require__('/lib/ssb/utils/utils')
export const variantUtils: VariantUtilsLib = __non_webpack_require__('/lib/ssb/utils/variantUtils')

export type SSBUtilsLib = {
    alertUtils: AlertUtilsLib;
    arrayUtils: ArrayUtilsLib;
    breadcrumbsUtils: BreadcrumbsUtilsLib;
    dateUtils: DateUtilsLib;
    imageUtils: ImageUtilsLib;
    parentUtils: ParentUtilsLib;
    serverLog: ServerLogLib;
    solrUtils: SolrUtilsLib;
    subjectUtils: SubjectUtilsLib;
    textUtils: TextUtilsLib;
    utils: UtilsLib;
    variantUtils: VariantUtilsLib;
}
