import { ByteSource, Content } from '/lib/xp/content'
import { RowData } from '../../../lib/ssb/parts/highcharts/data/htmlTable'
import { isNumber, RowValue } from '../../../lib/ssb/utils/utils'
import { React4xp, RenderResponse } from '/lib/enonic/react4xp'
import { PreliminaryData, XmlParser } from '../../../lib/types/xmlParser'
import { Highmap } from '../../content-types/highmap/highmap'
import { HighmapPartConfig } from './highmap-part-config'

const {
  data: {
    forceArray
  }
} = __non_webpack_require__('/lib/util')
const {
  get,
  getAttachmentStream
} = __non_webpack_require__('/lib/xp/content')
const {
  getComponent,
  getContent
} = __non_webpack_require__('/lib/xp/portal')
const {
  getPhrases
} = __non_webpack_require__('/lib/ssb/utils/language')
const {
  readText
} = __non_webpack_require__('/lib/xp/io')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

interface MapFeatures {
  properties: {
    name?: string;
    capitalName?: string; };
}

interface MapResult {
  features: Array<MapFeatures>;
}

interface HighmapTable {
  table: {
    tbody: {
      tr: Array<RowData>;
    };
  };
}

interface HighmapFormattedTableData {
  capitalName: string;
  value: number;
}

interface ThresholdValues {
  to: number | undefined;
  from: number | undefined;
}

interface HighmapProps {
  title: string;
  subtitle: Highmap['subtitle'];
  description: Highmap['description'];
  mapFile: object;
  tableData: Array<HighmapFormattedTableData>;
  thresholdValues: Array<ThresholdValues>;
  hideTitle: Highmap['hideTitle'];
  colorPalette: Highmap['colorPalette'];
  numberDecimals: number | undefined;
  heightAspectRatio: Highmap['heightAspectRatio'];
  seriesTitle: Highmap['seriesTitle'];
  legendTitle: Highmap['legendTitle'];
  legendAlign: Highmap['legendAlign'];
  footnoteText: Highmap['footnoteText'];
  phrases: object;
  language: string | undefined;
}

exports.get = function(req: XP.Request): RenderResponse | XP.Response {
  try {
    const config: HighmapPartConfig = getComponent().config
    const highmapId: string | undefined = config.highmapId
    return renderPart(req, highmapId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request, highmapId: string | undefined): RenderResponse | XP.Response => {
  try {
    return renderPart(req, highmapId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request, highmapId: string | undefined): RenderResponse | XP.Response {
  const page: Content = getContent()
  const highmapContent: Content<Highmap> | null = highmapId ? get({
    key: highmapId
  }) : null

  const mapFile: Content | null = highmapContent && highmapContent.data.mapFile ? get({
    key: highmapContent.data.mapFile
  }) : null

  const mapStream: ByteSource | null = mapFile ? getAttachmentStream({
    key: mapFile._id,
    name: mapFile._name
  }) : null

  const mapResult: MapResult = mapStream ? JSON.parse(readText(mapStream)) : {}
  mapResult.features.forEach((element, index) => {
    if (element.properties.name) {
      // New property, to keep capitalization for display in map
      mapResult.features[index].properties.capitalName = element.properties.name.toUpperCase()
    }
  })

  if (highmapContent) {
    const tableData: Array<HighmapFormattedTableData> = []
    if (highmapContent.data.htmlTable) {
      const stringJson: string | undefined = highmapContent.data.htmlTable ? __.toNativeObject(xmlParser.parse(highmapContent.data.htmlTable)) : undefined
      const result: HighmapTable | undefined = stringJson ? JSON.parse(stringJson) : undefined
      const tableRow: HighmapTable['table']['tbody']['tr'] | undefined = result ? result.table.tbody.tr : undefined

      if (tableRow) {
        tableRow.map((row) => {
          if (row) {
            const name: string = getRowValue(row.td[0]) as string
            const value: number = getRowValue(row.td[1]) as number
            tableData.push({
              capitalName: name, // Matches map result name
              value: value
            })
          }
        })
      }
    }

    const thresholdValues: Highmap['thresholdValues'] = highmapContent.data.thresholdValues ? forceArray(highmapContent.data.thresholdValues) : []

    const props: HighmapProps = {
      title: highmapContent.displayName,
      subtitle: highmapContent.data.subtitle,
      description: highmapContent.data.description,
      mapFile: mapResult,
      tableData,
      thresholdValues: sortedThresholdValues(thresholdValues),
      hideTitle: highmapContent.data.hideTitle,
      colorPalette: highmapContent.data.colorPalette,
      numberDecimals: highmapContent.data.numberDecimals ? parseInt(highmapContent.data.numberDecimals) : undefined,
      heightAspectRatio: highmapContent.data.heightAspectRatio,
      seriesTitle: highmapContent.data.seriesTitle,
      legendTitle: highmapContent.data.legendTitle,
      legendAlign: highmapContent.data.legendAlign,
      footnoteText: highmapContent.data.footnoteText ? forceArray(highmapContent.data.footnoteText) : [],
      phrases: getPhrases(page),
      language: page.language
    }

    return React4xp.renderBody('site/parts/highmap/Highmap', props, req)
  }
  return {
    body: '',
    contentType: 'text/html'
  }
}

function getRowValue(value: number | string | PreliminaryData| Array<number | string | PreliminaryData>): RowValue {
  if (typeof value === 'string' && isNumber(value.replace(',', '.'))) {
    return Number(value.replace(',', '.'))
  }
  if (typeof value === 'object') {
    const valueObject: PreliminaryData = value as PreliminaryData
    const content: number | string = valueObject.content
    if (content) {
      return getRowValue(content)
    }
  }
  return value as RowValue
}

function sortedThresholdValues(thresholdValues: Highmap['thresholdValues']): Array<ThresholdValues> {
  if (thresholdValues.length) {
    const formattedThresholdValues: Array<number> = thresholdValues.map((t) => Number(t.replace(',', '.'))).sort((a, b) => a - b)
    const sortedDataClasses: Array<ThresholdValues> = getDataClass(formattedThresholdValues)

    if (sortedDataClasses.length) {
      return sortedDataClasses
    }
  }
  return []
}

function getDataClass(formattedThresholdValues: Array<number>): Array<ThresholdValues> {
  const dataClasses: Array<ThresholdValues> = []

  let previousValue: number = formattedThresholdValues[0]
  formattedThresholdValues.map((thresholdValue, index) => {
    const currentValue: number = formattedThresholdValues[index]

    if (previousValue == currentValue) {
      // Displays < currentValue in the chart
      dataClasses.push({
        to: currentValue,
        from: undefined
      })
    }

    if (previousValue < currentValue) {
      // Displays previousValue - currentValue in the chart
      dataClasses.push({
        to: currentValue,
        from: previousValue
      })
    }
    if (previousValue > currentValue) {
      // Displays currentValue - previousValue in the chart
      dataClasses.push({
        to: previousValue,
        from: currentValue
      })
    }

    previousValue = formattedThresholdValues[index]
  })

  // Displays > maximum value in the chart
  dataClasses.push({
    to: undefined,
    from: dataClasses[dataClasses.length - 1].to
  })

  return dataClasses
}

