import React, { useState } from 'react'
import { Link, FactBox, Tabs, Divider } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'
import { NumericFormat } from 'react-number-format'

interface StaticVisualizationProps {
  title?: string;
  imageSrc?: string;
  altText?: string;
  longDesc?: string;
  descriptionStaticVisualization?: string;
  footnotes?: unknown[];
  sourcesLabel?: string;
  showAsGraphLabel?: string;
  showAsTableLabel?: string;
  sources?: {
    url?: string;
    urlText?: string;
  }[];
  inFactPage?: boolean;
  language?: string;
  tableData?: {
    table?: unknown;
  };
  id?: string;
}

function StaticVisualization(props: StaticVisualizationProps) {
  const [activeTab, changeTab] = useState('figure')
  const tabClicked = (e) => changeTab(e)

  function renderLongDescriptionAndSources() {
    return (
      <React.Fragment>
        {props.longDesc ? <p className='pt-4'>{props.longDesc}</p> : null}
        {props.footnotes.length ? (
          <ul className={`footnote${props.inFactPage ? '' : ' pl-0'}`}>
            {props.footnotes.map((footnote, index) => (
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
      </React.Fragment>
    )
  }

  function renderTabs() {
    return (
      <React.Fragment>
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
      </React.Fragment>
    )
  }

  function createTable() {
    const tableData = props.tableData
    if (tableData) {
      return (
        <table className='statistics' aria-labelledby={`figure-caption-${props.id}`}>
          <thead>
            <tr>{createHeaderCell(tableData.table.thead.tr)}</tr>
          </thead>
          <tbody>
            {tableData.table.tbody.tr.map((row, index) => {
              return <tr key={index}>{createBodyCells(row)}</tr>
            })}
          </tbody>
        </table>
      )
    }
  }

  function createHeaderCell(row) {
    return row.th.map((cellValue, i) => {
      return (
        <th key={i} scope='col'>
          {trimValue(cellValue)}
        </th>
      )
    })
  }

  function createBodyCells(row) {
    return row.td.map((cellValue, i) => {
      if (i > 0) {
        return <td key={i}>{formatNumber(cellValue)}</td>
      } else {
        return (
          <th key={i} scope='row'>
            {trimValue(cellValue)}
          </th>
        )
      }
    })
  }

  function formatNumber(value) {
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

  function trimValue(value) {
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
                <img alt={props.altText} src={props.imageSrc} />
              </div>
            )}

            {activeTab === 'table' && (
              <div id={`tabpanel-1-${props.id}`} className='static-visualization-data'>
                {createTable()}
              </div>
            )}

            <FactBox header={props.descriptionStaticVisualization} text={renderLongDescriptionAndSources()} />
          </figure>
        </Col>
      </Row>
    </section>
  )
}

export default (props) => <StaticVisualization {...props} />
