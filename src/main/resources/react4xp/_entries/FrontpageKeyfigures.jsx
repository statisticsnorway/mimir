import React from 'react'
import PropTypes from 'prop-types'

class FrontpageKeyfigures extends React.Component {
  createRows() {
    const keyFigures = this.props.keyFigures

    return keyFigures.map((keyFigure, i) => {
      return (
        <React.Fragment key={`figure-${i}`}>
          <div className="col-12 col-lg-3">
            <a href={keyFigure.url} className="keyfigure-wrapper">
              <div className="keyfigure">
                <div className="ssb-link header">
                  <span className="link-text">{keyFigure.urlText}</span>
                </div>
                <div className="number-section">
                  {this.addKeyfigure(keyFigure)}
                </div>
              </div>
            </a>
          </div>
        </React.Fragment>
      )
    })
  }

  addKeyfigure(keyFigure) {
    if (keyFigure.number) {
      return (
        <React.Fragment>
          <div className="ssb-number small">{keyFigure.number}</div>
          <span className="kf-title subtitle">{keyFigure.numberDescription}</span>
        </React.Fragment>
      )
    } else {
      return (
        <span className="no-number">{keyFigure.noNumberText}</span>
      )
    }
  }

  render() {
    return <div className="container">
      <div className="row d-flex flex-wrap">
        {this.createRows()}
      </div>
    </div>
  }
}

FrontpageKeyfigures.propTypes = {
  keyFigures: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string,
      url: PropTypes.string,
      urlText: PropTypes.string,
      number: PropTypes.string,
      numberDescription: PropTypes.string,
      noNumberText: PropTypes.string
    })
  )
}

export default (props) => <FrontpageKeyfigures {...props}/>
