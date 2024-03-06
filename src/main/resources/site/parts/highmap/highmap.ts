import { get as getContentByKey, getAttachmentStream, type ByteSource, type Content } from '/lib/xp/content'
import { getComponent, getContent } from '/lib/xp/portal'
import { readText } from '/lib/xp/io'
import { isNumber, type RowValue } from '/lib/ssb/utils/utils'
import { render } from '/lib/enonic/react4xp'
import { type PreliminaryData, type XmlParser, type TbmlDataUniform, TableRowUniform } from '/lib/types/xmlParser'
import * as util from '/lib/util'
import { getPhrases } from '/lib/ssb/utils/language'
import { renderError } from '/lib/ssb/error/error'
import { HighmapProps, HighmapTable, MapResult, ThresholdValues } from '/lib/types/partTypes/highmap'
import { datasetOrUndefined } from '/lib/ssb/cache/cache'
import { type DatasetRepoNode, DataSource as DataSourceType } from '/lib/ssb/repo/dataset'
import { type Highmap } from '/site/content-types'

const xmlParser: XmlParser = __.newBean('no.ssb.xp.xmlparser.XmlParser')

export function get(req: XP.Request): XP.Response {
  try {
    const config = getComponent<XP.PartComponent.Highmap>()?.config
    if (!config) throw Error('No page found')
    const highmapId: string | undefined = config.highmapId

    if (req.mode === 'edit') {
      return renderEditPlaceholder()
    }
    return renderPart(req, highmapId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request, highmapId: string | undefined): XP.Response {
  try {
    return renderPart(req, highmapId)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderEditPlaceholder(): XP.Response {
  return {
    contentType: 'text/html',
    body: `
    <div class="edit-placeholder"><h2>HIGHMAP</h2>
      <p>Vises ikke i redigeringsmodus. Se den i forhåndsvisning.</p>
    </div>
    `,
  }
}

function renderPart(req: XP.Request, highmapId: string | undefined): XP.Response {
  const page = getContent()
  if (!page) throw new Error('No page found')

  const highmapContent: Content<Highmap> | null = highmapId
    ? getContentByKey({
        key: highmapId,
      })
    : null

  const mapFile: Content | null =
    highmapContent && highmapContent.data.mapFile
      ? getContentByKey({
          key: highmapContent.data.mapFile,
        })
      : null

  const mapStream: ByteSource | null = mapFile
    ? getAttachmentStream({
        key: mapFile._id,
        name: mapFile._name,
      })
    : null

  const mapResult: MapResult = mapStream ? JSON.parse(readText(mapStream)) : {}
  mapResult.features?.forEach((element, index) => {
    if (element.properties.name) {
      // New property, to keep capitalization for display in map
      mapResult.features[index].properties.capitalName = element.properties.name.toUpperCase()
    }
  })

  if (highmapContent) {
    const tableData: Array<RowValue[]> = getTableData(highmapContent)
    const thresholdValues: Highmap['thresholdValues'] = highmapContent.data.thresholdValues
      ? util.data.forceArray(highmapContent.data.thresholdValues)
      : []

    const props: HighmapProps = {
      title: highmapContent.displayName,
      subtitle: highmapContent.data.subtitle,
      description: highmapContent.data.description,
      mapFile: mapResult,
      tableData,
      mapDataSecondColumn: highmapContent.data.mapDataSecondColumn,
      thresholdValues: sortedThresholdValues(thresholdValues),
      hideTitle: highmapContent.data.hideTitle,
      color: highmapContent.data.color,
      numberDecimals: highmapContent.data.numberDecimals ? parseInt(highmapContent.data.numberDecimals) : undefined,
      heightAspectRatio: highmapContent.data.heightAspectRatio,
      seriesTitle: highmapContent.data.seriesTitle,
      legendTitle: highmapContent.data.legendTitle,
      legendAlign: highmapContent.data.legendAlign,
      sourceList: highmapContent.data.sourceList ? util.data.forceArray(highmapContent.data.sourceList) : undefined,
      footnoteText: highmapContent.data.footnoteText ? util.data.forceArray(highmapContent.data.footnoteText) : [],
      phrases: getPhrases(page),
      language: page.language,
    }
    // R4xp disables hydration in edit mode, but highmap need hydration to show
    // we sneaky swap mode since we want a render of highmap in edit mode
    // Works good for highmap macro, not so much when part
    if (req.mode === 'edit') req.mode = 'preview'
    return render('site/parts/highmap/Highmap', props, req)
  }
  return {
    body: '',
    contentType: 'text/html',
  }
}

function getTableData(highmap: Content<Highmap>): Array<RowValue[]> {
  if (highmap?.data.dataSource) {
    if (highmap.data.dataSource._selected === DataSourceType.HTMLTABLE) {
      return getHtmlTableData(highmap.data.dataSource.htmlTable.html)
    } else if (highmap.data.dataSource?._selected === DataSourceType.TBPROCESSOR) {
      return getTBMLData(highmap)
    }
  } else if (highmap.data.htmlTable) {
    return getHtmlTableData(highmap.data.htmlTable)
  }
  return []
}

function getHtmlTableData(htmlTable: string | undefined): Array<RowValue[]> {
  const tableData: Array<RowValue[]> = []

  if (htmlTable) {
    const stringJson: string | undefined = htmlTable ? __.toNativeObject(xmlParser.parse(htmlTable)) : undefined
    const result: HighmapTable | undefined = stringJson ? JSON.parse(stringJson) : undefined
    const tableRow: HighmapTable['table']['tbody']['tr'] | undefined = result ? result.table.tbody.tr : undefined

    if (tableRow) {
      tableRow.forEach((row) => {
        if (row) {
          tableData.push([getRowValue(row.td[0]), getRowValue(row.td[1])])
        }
      })
    }
  }
  return tableData
}

function getTBMLData(highmap: Content<Highmap>): Array<RowValue[]> {
  const datasetFromRepo: DatasetRepoNode<TbmlDataUniform | object> | undefined = datasetOrUndefined(highmap)
  const parsedData: TbmlDataUniform | object | string | undefined = datasetFromRepo && datasetFromRepo.data
  if (parsedData) {
    const tbmlData: TbmlDataUniform = parsedData as TbmlDataUniform
    const tbody: Array<TableRowUniform> = tbmlData.tbml.presentation.table.tbody
    const rows: TableRowUniform['tr'] = tbody[0].tr

    return rows
      ? rows.map((row) => {
          const capitalName: RowValue = highmap.data.removePartOfName
            ? firstPartOfCapitalName(getRowValue(row.th[0]))
            : getRowValue(row.th[0])
          return [capitalName, getRowValue(row.td[0])]
        })
      : []
  }
  return []
}

function firstPartOfCapitalName(name: RowValue): RowValue {
  return name && name.toString().indexOf(' - ') > 0 ? name.toString().split(' - ')[0] : name
}

function getRowValue(value: number | string | PreliminaryData | Array<number | string | PreliminaryData>): RowValue {
  // file deepcode ignore GlobalReplacementRegex: dont need replacAll when we are replacing only one character
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
  if (thresholdValues?.length) {
    const formattedThresholdValues: Array<number> = (thresholdValues as Array<string>)
      .map((t) => Number(t.replace(',', '.')))
      .sort((a, b) => a - b)
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
  formattedThresholdValues.forEach((thresholdValue, index) => {
    const currentValue: number = formattedThresholdValues[index]

    if (previousValue == currentValue) {
      // Displays < currentValue in the chart
      dataClasses.push({
        to: currentValue,
        from: undefined,
      })
    }

    if (previousValue < currentValue) {
      // Displays previousValue - currentValue in the chart
      dataClasses.push({
        to: currentValue,
        from: previousValue,
      })
    }
    if (previousValue > currentValue) {
      // Displays currentValue - previousValue in the chart
      dataClasses.push({
        to: previousValue,
        from: currentValue,
      })
    }

    previousValue = formattedThresholdValues[index]
  })

  // Displays > maximum value in the chart
  dataClasses.push({
    to: undefined,
    from: dataClasses[dataClasses.length - 1].to,
  })

  return dataClasses
}
