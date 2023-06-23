import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { Link, FactBox, Tabs, Divider } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'
import Table from '/react4xp/_entries/Table'

function StaticVisualization(props) {
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
          <p className='pt-2'>
            {props.sources.map((source, index) => (
              <p key={`source-${index}`} className='sources'>
                <Link className='mb-1' href={source.url}>
                  {props.sourcesLabel}: {source.urlText}
                </Link>
              </p>
            ))}
          </p>
        ) : null}
      </React.Fragment>
    )
  }

  function renderTabs() {
    return (
      <React.Fragment>
        <Tabs
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
      return <Table table={tableData} />
    }
  }

  return (
    <section className='container part-static-visualization'>
      <Row className='xp-part'>
        <Col className='xp-region col-12'>
          <figure>
            <figcaption className='mt-0'>{props.title}</figcaption>
            {renderTabs()}
            {activeTab === 'figure' && (
              <div className='static-visualization-chart d-flex justify-content-center'>
                <img alt={props.altText} src={props.imageSrc} />
              </div>
            )}

            {activeTab === 'table' && (
              <div className='static-visualization-data d-flex justify-content-center'>{createTable()}</div>
            )}

            <FactBox header={props.descriptionStaticVisualization} text={renderLongDescriptionAndSources()} />
          </figure>
        </Col>
      </Row>
    </section>
  )
}

StaticVisualization.propTypes = {
  title: PropTypes.string,
  imageSrc: PropTypes.string,
  altText: PropTypes.string,
  longDesc: PropTypes.string,
  descriptionStaticVisualization: PropTypes.string,
  footnotes: PropTypes.array,
  sourcesLabel: PropTypes.string,
  showAsGraphLabel: PropTypes.string,
  showAsTableLabel: PropTypes.string,
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      urlText: PropTypes.string,
    })
  ),
  inFactPage: PropTypes.bool,
  language: PropTypes.string,
  tableData: PropTypes.shape({
    caption:
      PropTypes.string |
      PropTypes.shape({
        content: PropTypes.string,
        noterefs: PropTypes.string,
      }),
    tableClass: PropTypes.string,
    thead: PropTypes.arrayOf(
      PropTypes.shape({
        td:
          PropTypes.array |
          PropTypes.number |
          PropTypes.string |
          PropTypes.shape({
            rowspan: PropTypes.number,
            colspan: PropTypes.number,
            content: PropTypes.string,
            class: PropTypes.string,
          }),
        th:
          PropTypes.array |
          PropTypes.number |
          PropTypes.string |
          PropTypes.shape({
            rowspan: PropTypes.number,
            colspan: PropTypes.number,
            content: PropTypes.string,
            class: PropTypes.string,
            noterefs: PropTypes.string,
          }),
      })
    ),
    tbody: PropTypes.arrayOf(
      PropTypes.shape({
        th:
          PropTypes.array |
          PropTypes.number |
          PropTypes.string |
          PropTypes.shape({
            content: PropTypes.string,
            class: PropTypes.string,
            noterefs: PropTypes.string,
          }),
        td:
          PropTypes.array |
          PropTypes.number |
          PropTypes.string |
          PropTypes.shape({
            content: PropTypes.string,
            class: PropTypes.string,
          }),
      })
    ),
    tfoot: PropTypes.shape({
      footnotes: PropTypes.arrayOf(
        PropTypes.shape({
          noteid: PropTypes.string,
          content: PropTypes.string,
        })
      ),
      correctionNotice: PropTypes.string,
    }),
    language: PropTypes.string,
    noteRefs: PropTypes.arrayOf(PropTypes.string),
  }),
}

export default (props) => <StaticVisualization {...props} />
