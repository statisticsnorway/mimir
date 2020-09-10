import { ContentLibrary, Content } from 'enonic-types/lib/content'
import { RepoCommonLib } from '../repo/common'
import { KeyFigure } from '../../site/content-types/keyFigure/keyFigure'
import { Dataquery } from '../../site/content-types/dataquery/dataquery'
import { DataSource } from '../../site/mixins/dataSource/dataSource'
import { Highchart } from '../../site/content-types/highchart/highchart'
import { Socket } from '../types/socket'

const {
  query,
  modify,
  delete: deleteContent,
  get: getContent,
  publish
}: ContentLibrary = __non_webpack_require__( '/lib/xp/content')
const {
  withSuperUserContext
}: RepoCommonLib = __non_webpack_require__( '/lib/repo/common')

export function setupHandlers(socket: Socket): void {
  // KEYFIGURE
  socket.on('convert-key-figure-start', () => {
    withSuperUserContext('com.enonic.cms.default', 'draft', () => {
      const keyFigures: Array<Content<KeyFigure>> = query({
        start: 0,
        count: 2000,
        contentTypes: [`${app.name}:keyFigure`],
        query: `data.dataquery LIKE "*"`
      }).hits as Array<Content<KeyFigure>>

      keyFigures.forEach((keyFigure, index) => {
        try {
          convertKeyFigure(keyFigure)
        } catch (err) {
          socket.emit('convert-error', {
            id: keyFigure._id,
            type: keyFigure.type,
            path: keyFigure._path,
            displayName: keyFigure.displayName,
            error: err.toString()
          })
        }
        socket.emit('convert-key-figure-update', {
          key: 'convert-key-figure',
          current: index + 1
        })
      })
    })
  })

  // HIGHCHART
  socket.on('convert-highchart-start', () => {
    withSuperUserContext('com.enonic.cms.default', 'draft', () => {
      const highcharts: Array<Content<Highchart>> = query({
        start: 0,
        count: 2000,
        contentTypes: [`${app.name}:highchart`],
        query: `data.dataquery LIKE "*"`
      }).hits as Array<Content<Highchart>>

      highcharts.forEach((highchart, index) => {
        try {
          convertHighchart(highchart)
        } catch (err) {
          socket.emit('convert-error', {
            id: highchart._id,
            type: highchart.type,
            path: highchart._path,
            displayName: highchart.displayName,
            error: err.toString()
          })
        }
        socket.emit('convert-highchart-update', {
          key: 'convert-highchart',
          current: index + 1
        })
      })
    })
  })
}

function convert(element: Content<DataSource>, queryId: string): void {
  const dataquery: Content<Dataquery> | null = getContent({
    key: queryId
  })
  if (dataquery) {
    modify({
      key: element._id,
      editor: (c: Content<Highchart | KeyFigure>) => {
        delete c.data.dataquery
        const dataSource: DataSource['dataSource'] | null = dataqueryToDataSource(dataquery)
        if (dataSource) {
          c.data.dataSource = dataSource
        }

        // remove old attributes from highchart
        if (c.type === `${app.name}:highchart` && c.data) {
          if (c.data.hasOwnProperty('xAllowDecimal')) {
            delete (c.data as unknown as OldHighchartData).xAllowDecimal
          }
          if (c.data.hasOwnProperty('yAxisAllowDecimal')) {
            delete (c.data as unknown as OldHighchartData).yAxisAllowDecimal
          }
          if (c.data.hasOwnProperty('type')) {
            delete (c.data as unknown as OldHighchartData).type
          }
          if (c.data.hasOwnProperty('numberdecimals')) {
            delete (c.data as unknown as OldHighchartData).numberdecimals
          }
          if (c.data.hasOwnProperty('stabling')) {
            delete (c.data as unknown as OldHighchartData).stabling
          }
          if (c.data.hasOwnProperty('zoomtype')) {
            delete (c.data as unknown as OldHighchartData).zoomtype
          }
          if (c.data.hasOwnProperty('kildetekst')) {
            delete (c.data as unknown as OldHighchartData).kildetekst
          }
          if (c.data.hasOwnProperty('kildeurl')) {
            delete (c.data as unknown as OldHighchartData).kildeurl
          }
          if (c.data.hasOwnProperty('forklaring-datagrunnlag')) {
            delete (c.data as unknown as OldHighchartData)['forklaring-datagrunnlag']
          }
          if (c.data.hasOwnProperty('nolegend')) {
            delete (c.data as unknown as OldHighchartData).nolegend
          }
          if (c.data.hasOwnProperty('pie-legend')) {
            delete (c.data as unknown as OldHighchartData)['pie-legend']
          }
          if (c.data.hasOwnProperty('byttraderogkolonner')) {
            delete (c.data as unknown as OldHighchartData).byttraderogkolonner
          }
          if (c.data.hasOwnProperty('stabelsum')) {
            delete (c.data as unknown as OldHighchartData).stabelsum
          }
        }

        return c
      }
    })
    deleteContent({
      key: dataquery._id
    })
    publish({
      keys: [element._id],
      sourceBranch: 'draft',
      targetBranch: 'master',
      includeDependencies: true
    })
  } else {
    throw new Error(`Query with id ${queryId} doesn't exist`)
  }
}

function convertHighchart(highchart: Content<Highchart>): void {
  const queryId: string | undefined = highchart.data.dataquery
  if (queryId) {
    convert(highchart, queryId)
  } else {
    throw new Error('No queryId')
  }
}

function convertKeyFigure(keyFigure: Content<KeyFigure>): void {
  const queryId: string | undefined = keyFigure.data.dataquery
  if (queryId) {
    convert(keyFigure, queryId)
  } else {
    throw new Error('no queryId')
  }
}

function dataqueryToDataSource(dataquery: Content<Dataquery>): DataSource['dataSource'] | null {
  if (dataquery.data.table) {
    let selected: string | null = dataquery.data.datasetFormat._selected
    const id: string | undefined = dataquery.data.table.split('/').filter((s) => !!s).pop()
    if (id) {
      if (selected === 'jsonStat') {
        selected = 'statbankApi'
        const oldOption: Dataquery['datasetFormat']['jsonStat'] = dataquery.data.datasetFormat.jsonStat
        return {
          _selected: selected,
          statbankApi: {
            urlOrId: id,
            json: dataquery.data.json,
            datasetFilterOptions: oldOption ? oldOption.datasetFilterOptions : undefined,
            xAxisLabel: oldOption ? oldOption.xAxisLabel : undefined,
            yAxisLabel: oldOption ? oldOption.yAxisLabel : undefined
          }
        }
      } else if (selected === 'tbml') {
        selected = 'tbprocessor'
        return {
          _selected: selected,
          tbprocessor: {
            urlOrId: id
          }
        }
      } else if (selected === 'klass') {
        return {
          _selected: 'klass',
          klass: {
            url: dataquery.data.table
          }
        }
      }
    }
  }
  return null
}

interface OldHighchartData extends DataSource{
  xAllowDecimal: boolean;
  yAxisAllowDecimal: boolean;
  type: string;
  numberdecimals: number;
  stabling: string;
  zoomtype: string;
  kildetekst: string;
  kildeurl: string;
  'forklaring-datagrunnlag': string;
  nolegend: boolean;
  'pie-legend': boolean;
  byttraderogkolonner: boolean;
  stabelsum: boolean;
}
