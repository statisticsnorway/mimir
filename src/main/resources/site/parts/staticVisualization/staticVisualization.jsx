import React, { useState } from 'react'
import { PropTypes } from 'prop-types'
import { Title, Link, Tabs, Divider } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'
function StaticVisualization(props) {
  const [activeTab, changeTab] = useState('figure')
  const tabClicked = (e) => changeTab(e)

  function renderTabs() {
    if (props.tableData !== '') {
      return (
        <div>
          <Tabs
            activeOnInit="figure"
            onClick={tabClicked}
            items={[
              {
                title: 'Vis som figur',
                path: 'figure'
              },
              {
                title: 'Vis som tabell',
                path: 'table'
              }
            ]}
          />
          <Divider className="mb-4" />
        </div>
      )
    }
  }

  return (
    <section className="container part-static-visualization">
      <Row className="xp-part">
        <Col className="xp-region col-12">
          <Title size={2} className="mt-0">{props.title}</Title>
          {renderTabs()}
          {activeTab === 'figure' && (
            <div className="d-flex justify-content-center">
              <img alt={props.altText} src={props.imageSrc} />
              <a href={props.longDesc} className="sr-only">{props.descriptionStaticVisualization}</a>
            </div>
          )}

          {activeTab === 'table' && (
            <div className="d-flex justify-content-center">
              <div className="article-body searchabletext"
                dangerouslySetInnerHTML={{
                  __html: props.tableData
                }}
              />
            </div>
          )}

          {props.footnotes.length ?
            <ul className={`footnote${props.inFactPage ? '' : ' pl-0'}`}>
              {props.footnotes.map((footnote, index) =>
                <li key={`footnote-${index}`}>
                  <sup>{index + 1}</sup>
                  <span>{footnote}</span>
                </li>
              )}
            </ul> : null}

          {props.sources.length ?
            <>
              <b className="source-title">{props.sourcesLabel}</b>
              {props.sources.map((source, index) =>
                <p key={`source-${index}`} className="sources">
                  <Link className="mb-1" href={source.url}>{source.urlText}</Link>
                </p>)}
            </> : null}
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
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      urlText: PropTypes.string
    })
  ),
  inFactPage: PropTypes.bool,
  tableData: PropTypes.string
}

export default (props) => <StaticVisualization {...props} />
