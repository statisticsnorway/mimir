import React, { useState } from 'react'
import {
  Link,
  ExpansionBox,
  Tabs,
  Divider,
  Table as SSBTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'
import { NumericFormat } from 'react-number-format'
import { type StaticVisualizationProps } from '../../../lib/types/partTypes/staticVisualization'
import { HtmlTable, type BodyCell } from '../../../lib/types/partTypes/table'

function StaticVisualization(props: StaticVisualizationProps) {
  const [activeTab, changeTab] = useState('figure')
  const tabClicked = (e: string) => changeTab(e)

  function renderLongDescriptionAndSources() {
    return (
      <>
        {props.longDesc ? <p className='pt-4'>{props.longDesc}</p> : null}
        {props.footnotes?.length ? (
          <ul className={`footnote${props.inFactPage ? '' : ' pl-0'}`}>
            {(props.footnotes as string[]).map((footnote, index) => (
              <li key={`footnote-${index}`}>
                <sup>{index + 1}</sup>
                <span>{footnote}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {props.sources.length ? (
          <div className='pt-2'>
            {props.sources.map((source, index) => (
              <p key={`source-${index}`} className='sources'>
                <Link className='mb-1' href={source.url}>
                  {props.sourcesLabel}: {source.urlText}
                </Link>
              </p>
            ))}
          </div>
        ) : null}
      </>
    )
  }

  function renderTabs() {
    return (
      <>
        <Tabs
          id={props.id}
          className='pl-4'
          activeOnInit='figure'
          onClick={tabClicked}
          items={[
            {
              title: props.showAsGraphLabel,
              path: 'figure',
            },
            {
              title: props.showAsTableLabel,
              path: 'table',
            },
          ]}
        />
        <Divider />
      </>
    )
  }

  function createTable() {
    const tableData = props.tableData
    if (tableData) {
      return (
        <SSBTable aria-labelledby={`figure-caption-${props.id}`}>
          <TableHead>
            <TableRow>{createHeaderCell(tableData.table.thead.tr)}</TableRow>
          </TableHead>
          <TableBody>
            {tableData.table.tbody.tr.map((row, index) => {
              return <TableRow key={index}>{createBodyCells(row)}</TableRow>
            })}
          </TableBody>
        </SSBTable>
      )
    }
  }

  function createHeaderCell(row: HtmlTable['table']['thead']['tr']) {
    return row.th.map((cellValue, i) => {
      return (
        <TableCell key={i} type='th' scope='col' align={i !== 0 ? 'right' : ''}>
          {trimValue(cellValue)}
        </TableCell>
      )
    })
  }

  function createBodyCells(row: BodyCell) {
    return row.td.map((cellValue, i) => {
      if (i > 0) {
        return (
          <TableCell key={i} align='right'>
            {formatNumber(cellValue)}
          </TableCell>
        )
      } else {
        return (
          <TableCell key={i} type='th' scope='row'>
            {trimValue(cellValue)}
          </TableCell>
        )
      }
    })
  }

  function formatNumber(value: string | number) {
    const language = props.language
    const decimalSeparator = language === 'en' ? '.' : ','
    value = trimValue(value)
    if (value) {
      if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
        const decimals = value.toString().indexOf('.') > -1 ? value.toString().split('.')[1].length : 0
        return (
          <NumericFormat
            value={Number(value)}
            displayType='text'
            thousandSeparator=' '
            decimalSeparator={decimalSeparator}
            decimalScale={decimals}
            fixedDecimalScale
          />
        )
      }
    }
    return value
  }

  function trimValue(value: string | number) {
    if (value && typeof value === 'string') {
      return value.trim()
    }
    return value
  }

  return (
    <section className='container part-static-visualization'>
      <Row className='xp-part'>
        <Col className='xp-region col-12'>
          <figure>
            <figcaption className='mt-0' id={`figure-caption-${props.id}`}>
              {props.title}
            </figcaption>
            {renderTabs()}
            {activeTab === 'figure' && (
              <div className='static-visualization-chart' id={`tabpanel-0-${props.id}`}>
                <img alt={props.altText} src={props.imageSrc} loading='lazy' />
              </div>
            )}

            {activeTab === 'table' && (
              <div id={`tabpanel-1-${props.id}`} className='static-visualization-data'>
                {createTable()}
              </div>
            )}

            <ExpansionBox header={props.descriptionStaticVisualization} text={renderLongDescriptionAndSources()} />
          </figure>
        </Col>
      </Row>
    </section>
  )
}

export default (props: StaticVisualizationProps) => <StaticVisualization {...props} />
