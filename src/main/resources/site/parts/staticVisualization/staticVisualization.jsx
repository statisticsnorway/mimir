import React from 'react'
import { PropTypes } from 'prop-types'
import { Title, Link, FactBox } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'

function StaticVisualization(props) {
  function renderLongDescriptionAndSources() {
    return (
      <React.Fragment>
        {props.longDesc ? <p className="pt-4">{props.longDesc}</p> : null}
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
          <p className="pt-2">
            {props.sources.map((source, index) =>
              <p key={`source-${index}`} className="sources">
                <Link className="mb-1" href={source.url}>{props.sourcesLabel}: {source.urlText}</Link>
              </p>)}
          </p> : null}
      </React.Fragment>
    )
  }

  return (
    <section className="container part-static-visualization">
      <Row className="xp-part">
        <Col className="xp-region col-12">
          <Title size={2} className="mt-0">{props.title}</Title>

          <div className="d-flex justify-content-center mb-5">
            <img alt={props.altText} src={props.imageSrc} />
          </div>

          <FactBox
            header={props.descriptionStaticVisualization}
            text={renderLongDescriptionAndSources()}
          />

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
