import React, { useEffect, useRef } from 'react'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { Row, Col, Container } from 'react-bootstrap'
import { Tabs, Divider, Link } from '@statisticsnorway/ssb-component-library'
import 'highcharts/modules/accessibility'
import 'highcharts/modules/exporting'
import 'highcharts/modules/offline-exporting'
import 'highcharts/modules/export-data'
import 'highcharts/modules/data'
import 'highcharts/modules/no-data-to-display'
import 'highcharts/modules/broken-axis'

import { exportHighchartsToExcel } from '/lib/ssb/utils/tableExportUtils'
import { type HighchartsReactProps, type HighchartsPartProps } from '/lib/types/partTypes/highchartsReact'

import accessibilityLang from '/lib/ssb/parts/highcharts/highchart-lang.json'

function Highchart(props: HighchartsReactProps) {
  const { highcharts, language, phrases } = props
  const highchartsWrapperRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const handleShowAsTable = (tableWrapperElement: Element, highchartElement: Element, showTable = false) => {
    tableWrapperElement?.classList.toggle('d-none', !showTable)
    tableWrapperElement?.setAttribute('aria-hidden', (!showTable)?.toString())
    highchartElement?.classList.toggle('d-none', showTable)
    highchartElement?.setAttribute('aria-hidden', showTable?.toString())
  }

  useEffect(() => {
    if (highcharts?.length) {
      highcharts.forEach(({ contentKey, defaultShowAsTable }) => {
        const highchartWrapperElement = highchartsWrapperRefs.current[contentKey as string]?.children
        if (!highchartWrapperElement) return

        const [highchartElement, tableWrapperElement] = Array.from(highchartWrapperElement as HTMLCollection) ?? []
        const tableElement = tableWrapperElement?.children[0]

        tableWrapperElement?.classList.add('ssb-table-wrapper')
        tableElement?.classList.add('statistics', 'ssb-table')

        // Workaround to prevent auto-focus on table on initial render by removing tabindex, then re-enable after a delay
        if (defaultShowAsTable) tableElement?.removeAttribute('tabindex')
        setTimeout(() => {
          tableElement?.setAttribute('tabindex', '0')
        }, 1000)

        // Add Tab component accessibility tags for Highcharts and table
        // id is set in containerProps of the HighchartsReact component, while role can't be overwritten in the same way
        highchartElement?.setAttribute('role', 'tabpanel')
        tableWrapperElement?.setAttribute('id', 'tabpanel-1-' + contentKey)
        tableWrapperElement?.setAttribute('role', 'tabpanel')

        // Apply default show as table on initial render
        handleShowAsTable(tableWrapperElement, highchartElement, defaultShowAsTable)
      })
    }
  }, [highcharts])

  const handleTabOnClick = (contentKey: string) => (item: string) => {
    const showTable = item === 'show-as-table'

    const highchartWrapperElement = highchartsWrapperRefs.current[contentKey]?.children
    if (!highchartWrapperElement) return

    const [highchartElement, tableWrapperElement] = Array.from(highchartWrapperElement as HTMLCollection) ?? []
    handleShowAsTable(tableWrapperElement, highchartElement, showTable)
  }

  const downloadAsXLSX = (title: string | undefined) =>
    function (this: Highcharts.Exporting) {
      // @ts-ignore: The getDataRows function belongs to the Highcharts.Exporting class (https://api.highcharts.com/class-reference/Highcharts.Exporting#getDataRows),
      // but is not exported as a type.
      const rows = this.getDataRows(true)
      exportHighchartsToExcel({
        rows: rows.slice(1),
        fileName: title ? `${title}.xlsx` : 'graf.xlsx',
      })
    }

  // Workaround to get correct number formatting in table
  const formatNumbersInTable = (type: string) =>
    function (chart: Highcharts.ExportDataEventObject) {
      for (const row of chart.dataRows) {
        // Escaping first value not to format category ie. year
        for (const [i, cell] of Object.entries(row)) {
          if (Number(i) > 0 && typeof cell === 'number') {
            // Format absolute values for bar negative charts
            const value = type === 'barNegative' ? Math.abs(Number(cell)) : Number(cell)
            row[Number(i)] = value.toLocaleString(language === 'en' ? 'en-EN' : 'no-NO').replace('NaN', '')
          }
        }
      }
    }

  const getYLabel = (el: Highcharts.SVGElement | undefined) => {
    if (!el) return undefined

    const yAttr = el.attr('y')
    if (typeof yAttr === 'number') return yAttr
    if (typeof yAttr === 'string') {
      const n = Number(yAttr)
      if (!Number.isNaN(n)) return n
    }
    return undefined
  }

  // Draws the broken y-axis symbol based on current plot dimensions
  const renderBrokenYAxisSymbol = (chart: Highcharts.Chart, yAxisConfig?: Highcharts.YAxisOptions) => {
    const group = ensureBrokenAxisGroup(chart)
    const offset = yAxisConfig?.opposite ? chart.plotWidth : 0
    const x = chart.plotLeft + offset - 10
    const y = chart.plotTop + chart.plotHeight - 10

    chart.renderer
      .path([
        ['M', x, y],
        ['l', 20, -5],
      ])
      .attr({ 'stroke-width': 1, stroke: 'black' })
      .add(group)

    chart.renderer
      .path([
        ['M', x, y + 5],
        ['l', 20, -5],
      ])
      .attr({ 'stroke-width': 1, stroke: 'black' })
      .add(group)
  }

  const renderBrokenYAxisTickLabel = (chartYAxis: Highcharts.Axis, yAxisConfig?: Highcharts.YAxisOptions) => {
    const decimalsMatch = (yAxisConfig?.labels?.format?.[9] as string) ?? 0
    const zeroFormatted = Highcharts.numberFormat(0, Number(decimalsMatch))

    const tickPositions = chartYAxis.tickPositions ?? []
    const firstTickValue = tickPositions[0]
    const firstTickLabel = chartYAxis.ticks[firstTickValue]?.label

    // Replace first tick label with 0 since the label is displayed below the broken axis symbol (for yMin > 0)
    if (firstTickLabel) {
      firstTickLabel.attr({
        text: zeroFormatted,
      })
    }

    const secondTickValue = tickPositions[1]
    const secondTickLabel = chartYAxis.ticks[secondTickValue]?.label

    if (firstTickLabel && secondTickLabel) {
      const firstY = getYLabel(firstTickLabel)
      const secondY = getYLabel(secondTickLabel)

      // Hides second tick label if rendered on top of 0 (for broken axis)
      if (firstY !== null && secondY !== null && firstY === secondY) {
        secondTickLabel.hide()
      }
    }
  }

  // Ensures a single SVG group for broken y-axis symbols (no duplicates)
  const ensureBrokenAxisGroup = (chart: Highcharts.Chart): Highcharts.SVGElement => {
    const chartWithBrokenAxisGroup = chart as Highcharts.Chart & {
      brokenAxisGroup?: Highcharts.SVGElement
    }
    chartWithBrokenAxisGroup.brokenAxisGroup ??= chart.renderer.g('broken-axis-symbols').add()

    return chartWithBrokenAxisGroup.brokenAxisGroup
  }

  // Render broken y-axis symbols and labels
  const setBrokenYAxisOptions = (config: Highcharts.Options) =>
    function (this: Highcharts.Chart) {
      const chartYAxis = this.yAxis
      if (!chartYAxis?.length) return

      // Clear previous symbols before redraw to avoid duplicates and keep position in sync
      const group = ensureBrokenAxisGroup(this)
      while (group.element.firstChild) {
        group.element.firstChild.remove()
      }

      for (let i = 0; i < chartYAxis.length; i++) {
        // @ts-ignore: added by highcharts/modules/broken-axis at runtime
        const hasBrokenYAxis = (chartYAxis[i].min as number) > 0 || chartYAxis[i].brokenAxis?.hasBreaks
        if (!hasBrokenYAxis) continue

        const yAxisConfig = Array.isArray(config.yAxis) ? config.yAxis[i] : config.yAxis
        renderBrokenYAxisTickLabel(chartYAxis[i], yAxisConfig)
        renderBrokenYAxisSymbol(this, yAxisConfig)
      }
    }

  const setPieChartLegend = (config: Highcharts.Options) => {
    if (config.chart?.type === 'pie') {
      if (!config.legend) return
      config.legend.labelFormatter = function name() {
        return Array.isArray(this.name) ? this.name[0] : this.name
      }
    }
  }

  const setReversedStacksBarAndColumn = (config: Highcharts.Options) => {
    if (config.chart?.type === 'bar' || config.chart?.type === 'column') {
      const yAxisConfig = config.yAxis
      if (!yAxisConfig) return

      if (Array.isArray(yAxisConfig)) {
        return yAxisConfig.forEach((yAxis) => {
          yAxis.reversedStacks = false
        })
      } else {
        yAxisConfig.reversedStacks = false
      }
    }
    return
  }

  const formatYAxisLabelsToAbsoluteValue = (yAxisConfig: Highcharts.YAxisOptions) => {
    if (!yAxisConfig.labels) return
    yAxisConfig.labels.formatter = (a) => Math.abs(a.value as number).toString()
  }

  // Show absolute values on yAxis labels for bar charts with negative values
  const formatBarNegativeYAxisValues = (config: Highcharts.Options, type: string) => {
    if (type === 'barNegative') {
      const yAxisConfig = config.yAxis
      if (!yAxisConfig) return

      if (Array.isArray(yAxisConfig)) {
        return yAxisConfig.forEach((yAxis) => {
          formatYAxisLabelsToAbsoluteValue(yAxis)
        })
      } else {
        formatYAxisLabelsToAbsoluteValue(yAxisConfig)
      }
    }
    return
  }

  // Show absolute values on tooltip for bar charts with negative values
  const formatBarNegativeTooltipValues = (config: Highcharts.Options, type: string) => {
    if (type === 'barNegative') {
      if (!config.tooltip) return
      config.tooltip.formatter = function (this: Highcharts.Point) {
        return `<b>${this.series.name} ${this.category}:</b> ` + Highcharts.numberFormat(Math.abs(this.y as number), 0)
      }
    }
  }

  // Only show plotOption marker on last data element / single data point series
  const setPlotPointMarker = (config: Highcharts.Options) => {
    if (config.chart?.type === 'line') {
      const seriesConfig = config.series as Highcharts.SeriesLineOptions[]
      if (!seriesConfig) return
      return seriesConfig.map((series) => {
        const indices = series.data?.map((element) => element !== null)
        const lastIndex = indices?.lastIndexOf(true)

        series.data = series.data?.map((data, index) => ({
          y: Number.parseFloat(data as string),
          marker: {
            enabled: index === lastIndex,
          },
        }))
      })
    }
    return
  }

  function renderAlert(variant: 'info' | 'warning', text: string) {
    return (
      <div className={`mt-4 alert alert-${variant}`} role='alert'>
        {text}
      </div>
    )
  }

  // This alert will only be visible in preview mode with showDraft param, and for Highcharts with tbprocessor as source
  function renderHighchartDraftAlert(config: HighchartsPartProps['config']) {
    if (config?.draft) return renderAlert('info', 'Tallet i figuren nedenfor er upublisert')
    if (config?.noDraftAvailable) return renderAlert('warning', 'Det finnes ingen upubliserte tall for denne figuren')
    return null
  }

  function renderShowAsFigureOrTableTab(highchartId: string, defaultShowAsTable?: boolean) {
    return (
      <Col className='col-12 mb-3'>
        <Tabs
          id={highchartId}
          activeOnInit={defaultShowAsTable ? 'show-as-table' : 'show-as-chart'}
          items={[
            { title: phrases?.['highcharts.showAsChart'], path: 'show-as-chart' },
            { title: phrases?.['highcharts.showAsTable'], path: 'show-as-table' },
          ]}
          onClick={handleTabOnClick(highchartId)}
        />
        <Divider className='mb-3' />
      </Col>
    )
  }

  function renderHighchartsSource(sourceList: HighchartsPartProps['sourceList']) {
    return sourceList?.map(({ sourceHref, sourceText }, index) => (
      <Col key={index} className='highcharts-source col-12 mt-3'>
        <Link href={sourceHref} standAlone>
          {phrases?.source}: {sourceText}
        </Link>
      </Col>
    ))
  }

  function renderHighchartsFooter(
    footnoteText: HighchartsPartProps['footnoteText'],
    creditsEnabled: HighchartsPartProps['creditsEnabled'],
    sourceList: HighchartsPartProps['sourceList']
  ) {
    return (
      <Row>
        {footnoteText ? <Col className='footnote col-12'>{footnoteText}</Col> : null}
        {creditsEnabled ? renderHighchartsSource(sourceList) : null}
      </Row>
    )
  }

  function renderHighcharts() {
    if (!highcharts?.length) return null

    return highcharts.map((highchart, index) => {
      if (!highchart.config) return
      const highchartConfig = highchart.config as Highcharts.Options
      const lang =
        language === 'en'
          ? {
              locale: 'en-GB',
            }
          : accessibilityLang.lang
      const xAxisOptions = highchartConfig.xAxis as Highcharts.XAxisOptions

      const config = {
        ...highchartConfig,
        lang: {
          ...lang,
          categoryHeader: xAxisOptions.title?.text ?? 'Category',
        },
        chart: {
          ...highchartConfig.chart,
          events: {
            ...highchartConfig.chart?.events,
            exportData: formatNumbersInTable(highchart.type as string),
            render: setBrokenYAxisOptions(highchartConfig),
          },
        },
        exporting: {
          ...highchartConfig.exporting,
          menuItemDefinitions: {
            downloadXLS: {
              onclick: downloadAsXLSX(highchartConfig.title?.text),
            },
          },
        },
      }

      setPieChartLegend(highchartConfig) // Overwrite config.legend.labelFormatter for pie charts
      setReversedStacksBarAndColumn(highchartConfig) // Overwrite config.yAxis.reversedStacks for bar and column charts
      setPlotPointMarker(highchartConfig) // Overwrite config.series.data to show marker only on last data point for line charts

      // Overwrite config.yAxis.labels.formatter and config.tooltip.formatter for bar negative charts
      formatBarNegativeYAxisValues(highchartConfig, highchart.type as string)
      formatBarNegativeTooltipValues(highchartConfig, highchart.type as string)

      return (
        <Col
          key={`highchart-${highchart.contentKey}`}
          className={`col-12${highcharts.length !== index + 1 ? ' mb-5' : ''}`}
        >
          {renderHighchartDraftAlert(highchartConfig)}
          <figure id={`figure-${highchart.contentKey}`} className='highcharts-figure mb-0 hide-title'>
            <figcaption className='figure-title'>{config.title?.text}</figcaption>
            {config.subtitle?.text ? <p className='figure-subtitle'>{config.subtitle.text}</p> : null}
            {renderShowAsFigureOrTableTab(highchart.contentKey as string, highchart.defaultShowAsTable)}
            <div ref={(el) => (highchartsWrapperRefs.current[highchart.contentKey as string] = el)}>
              <HighchartsReact
                containerProps={{
                  id: `tabpanel-0-${highchart.contentKey}`,
                  className: `highcharts-canvas${highchart.defaultShowAsTable ? ' d-none' : ''}`,
                }}
                highcharts={Highcharts}
                options={config}
              />
            </div>
          </figure>
          {renderHighchartsFooter(highchart.footnoteText, highchart.creditsEnabled, highchart.sourceList)}
        </Col>
      )
    })
  }

  return (
    <Container>
      <Row>{renderHighcharts()}</Row>
    </Container>
  )
}

export default (props: HighchartsReactProps) => <Highchart {...props} />
