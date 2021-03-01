import React from 'react'
import PropTypes from 'prop-types'

class FrontpageKeyfigures extends React.Component {
  createRows() {
    const keyFigures = this.props.keyFigures

    return keyFigures.map((keyFigure, i) => {
      return (
        <React.Fragment key={`figure-${i}`}>
          <div className="col-lg-3">
            <div className="keyfigure">
              <h4 className="mb-2">{keyFigure.title}</h4>
              <div className="number-section">
                <div className="ssb-number small">{keyFigure.number}</div>
                <span className="kf-title subtitle">{keyFigure.numberDescription}</span>
              </div>
            </div>
          </div>
        </React.Fragment>
      )
    })
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
      number: PropTypes.string,
      numberDescription: PropTypes.string,
      noNumberText: PropTypes.string,
      title: PropTypes.string,
      time: PropTypes.string
    })
  )
}

export default (props) => <FrontpageKeyfigures {...props}/>
