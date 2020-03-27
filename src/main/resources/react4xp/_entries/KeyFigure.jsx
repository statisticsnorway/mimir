import React from 'react'
import { KeyFigures as SSBKeyFigures, References, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class KeyFigures extends React.Component {
  createRows() {
    const {
      keyFigures,
      columns
    } = this.props

    let isRight = true
    return keyFigures.map((keyFigure, i) => {
      isRight = (!columns || (columns && !isRight) || keyFigure.size === 'large')
      return (
        <React.Fragment key={`figure-${i}`}>
          <div className={`col-12 ${columns && keyFigure.size !== 'large' ? 'col-md-6' : ''}`}>
            <SSBKeyFigures {...keyFigure} icon={keyFigure.iconUrl && <img src={keyFigure.iconUrl} alt={keyFigure.iconAltText}></img>}/>
            {this.addKeyFigureSource(keyFigure)}
          </div>
          {i < keyFigures.length - 1 ? <Divider className={`my-5 d-block ${!isRight ? 'd-md-none' : ''}`} light /> : null}
        </React.Fragment>
      )
    })
  }

  addKeyFigureSource(keyFigure) {
    if ((!this.props.source || !this.props.source.url) && keyFigure.source && keyFigure.source.url) {
      return (
        <References className={`${keyFigure.size !== 'large' ? 'mt-3' : ''}`} title="Kilde" referenceList={[{
          href: keyFigure.source.url,
          label: keyFigure.source.title
        }]}/>
      )
    }
    return
  }

  addSource() {
    if (this.props.source && this.props.source.url) {
      return (
        <References className="col-12 mt-3" title="Kilde" referenceList={[{
          href: this.props.source.url,
          label: this.props.source.title
        }]}/>
      )
    }
    return
  }

  addHeader() {
    if (this.props.displayName) {
      return (
        <h3 className="mb-5">{this.props.displayName}</h3>
      )
    }
    return
  }

  render() {
    return <div className="container">
      {this.addHeader()}
      <div className="row">
        {this.createRows()}
        {this.addSource()}
      </div>
    </div>
  }
}

KeyFigures.propTypes = {
  displayName: PropTypes.string,
  keyFigures: PropTypes.arrayOf(
    PropTypes.shape({
      iconUrl: PropTypes.string,
      iconAltText: PropTypes.string,
      number: PropTypes.string,
      numberDescription: PropTypes.string,
      noNumberText: PropTypes.string,
      size: PropTypes.string,
      title: PropTypes.string,
      time: PropTypes.string,
      changes: PropTypes.shape({
        changeDirection: PropTypes.string,
        changeText: PropTypes.string,
        changePeriod: PropTypes.string
      }),
      glossary: PropTypes.string,
      greenBox: PropTypes.bool,
      source: PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.title
      })
    })
  ),
  source: PropTypes.shape({
    url: PropTypes.string,
    title: PropTypes.title
  }),
  columns: PropTypes.bool
}

export default (props) => <KeyFigures {...props}/>
