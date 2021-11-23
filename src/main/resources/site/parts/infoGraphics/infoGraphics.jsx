import React from 'react'
import { PropTypes } from 'prop-types'
import { Title, Link } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'

function InfoGraphics(props) {
  return (
    <section className="container part-infoGraphic">
      <Row className="xp-part">
        <Col className="xp-region col-12">
          <div className="border-top-green">
            <Title size={2} className="mt-0">{props.title}</Title>

            <div className="d-flex justify-content-center">
              <img alt={props.altText} src={props.imageSrc} />
              <a href={props.longDesc} className="sr-only">{props.descriptionInfographics}</a>
            </div>

            {props.footnotes.length ?
              props.footnotes.map((footnote, index) =>
                <ul key={`footnote-${index}`} className="footnote">
                  <li>
                    <sup>{index}</sup>
                    <span>{footnote}</span>
                  </li>
                </ul>) : null}

            <b className="source-title">{props.sourcesLabel}</b>
            {props.sources.length ?
              props.sources.map((source, index) =>
                <p key={`source-${index}`} className="sources">
                  <Link className="mb-1" href={source.url}>{source.urlText}</Link>
                </p>) : null}
          </div>
        </Col>
      </Row>
    </section>

  )
}

InfoGraphics.propTypes = {
  title: PropTypes.string,
  imageSrc: PropTypes.string,
  altText: PropTypes.string,
  longDesc: PropTypes.string,
  descriptionInfographics: PropTypes.string,
  footnotes: PropTypes.array,
  sourcesLabel: PropTypes.string,
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string,
      urlText: PropTypes.string
    })
  )
}

export default (props) => <InfoGraphics {...props} />
