import {Request} from "enonic-types/controller";
import {Highchart} from "../../site/content-types/highchart/highchart";
import {Content} from "enonic-types/content";
import {JSONstat} from "../types/jsonstat-toolkit";
import {TbmlDataUniform} from "../types/xmlParser";

const {
  prepareHighchartsGraphConfig
} = __non_webpack_require__( '/lib/highcharts/highchartsGraphConfig')
const {
  mergeDeepRight
} = require('ramda')
const {
  prepareHighchartsData
} = __non_webpack_require__('/lib/highcharts/highchartsData')


export function createHighchartObject(
  req: Request,
  highchart: Content<Highchart>,
  data: JSONstat | TbmlDataUniform | object | string | undefined,
  dataFormat: string): HighchartObject {
  const highchartsData: HighchartsData = prepareHighchartsData(req, highchart, data, dataFormat)
  const highchartsGraphConfig: HighchartsGraphConfig = prepareHighchartsGraphConfig(highchart, dataFormat, highchartsData && highchartsData.categories)
  return mergeDeepRight(highchartsData, highchartsGraphConfig)
}

export interface HighchartObject {

}

export interface HighchartsData {
  series: Array<{
    data: object;
    name: string;
  }>;
  categories: object;
}

export interface HighchartsGraphConfig {

}
