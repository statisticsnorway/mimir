import React from 'react'
import { PropTypes } from 'prop-types'
import { Title, Link } from '@statisticsnorway/ssb-component-library'
import { Row, Col } from 'react-bootstrap'

function InfoGraphics(props) {
  return (
    <section className="container part-infoGraphic">
      <Row className="xp-part">
        <Col className={`xp-region col-12${props.oldContent || (!props.inFactPage) ? '' : ' p-md-0'}`}>
          <div className={props.oldContent && 'border-top-green'}>
            <Title size={2} className="mt-0">{props.title}</Title>

            <div className="d-flex justify-content-center">
              <img alt={props.altText} src={props.imageSrc} />
              <a href={props.longDesc} className="sr-only">{props.descriptionInfographics}</a>
            </div>

            {props.footnotes.length ?
              <ul className="footnote">
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
  ),
  inFactPage: PropTypes.bool,
  oldContent: PropTypes.bool // TODO: Remove after content has been transferred to the content type
}

export default (props) => <InfoGraphics {...props} />
