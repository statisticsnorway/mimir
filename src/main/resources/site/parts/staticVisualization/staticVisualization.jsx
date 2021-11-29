import React from 'react'
import { PropTypes } from 'prop-types'
import { Title, Link } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'

function StaticVisualization(props) {
  return (
    <section className="container part-static-visualization">
      <Row className="xp-part">
        <Col className="xp-region col-12">
          <Title size={2} className="mt-0">{props.title}</Title>

          <div className="d-flex justify-content-center">
            <img alt={props.altText} src={props.imageSrc} />
            <a href={props.longDesc} className="sr-only">{props.descriptionStaticVisualization}</a>
          </div>

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
  inFactPage: PropTypes.bool
}

export default (props) => <StaticVisualization {...props} />
