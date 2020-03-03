import React from 'react'
import { KeyFigures as SSBKeyFigures, References, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

class KeyFigures extends React.Component {
  createRows() {
    const {
      keyFigures
    } = this.props
    const rows = []
    keyFigures.forEach((keyFigure, index) => {
      const row = rows[rows.length - 1]
      const prev = keyFigures[index - 1]
      if (!row || keyFigure.size === 'large' || keyFigure.greenBox || (prev && (prev.size === 'large' || prev.greenBox)) || row.keyFigures.length === 2) {
        rows.push({
          keyFigures: [keyFigure],
          classes: `${keyFigure.size !== 'large' && !keyFigure.greenBox ? 'row-cols-md-2' : ''}`
        })
      } else {
        row.keyFigures.push(keyFigure)
      }
    })

    return rows.map((row, i) => {
      return (
        <div key={`row-${i}`} className={`row row-cols-1 ${row.classes}`}>
          {row.keyFigures.map((keyFigure, j) => {
            return (
              <React.Fragment key={`figure-${j}`}>
                <div className="col">
                  <SSBKeyFigures {...keyFigure} icon={keyFigure.iconUrl && <img src={keyFigure.iconUrl} alt={keyFigure.iconAltText}></img>}/>
                  {this.addKeyFigureSource(keyFigure)}
                </div>
                {(j < row.keyFigures.length - 1) ? (<Divider className="w-100 d-block d-md-none" light />) : null}
              </React.Fragment>
            )
          })}
          {(i < rows.length - 1) ? (<Divider className="w-100 d-none d-md-block" light />) : null}
        </div>
      )
    })
  }

  addKeyFigureSource(keyFigure) {
    if ((!this.props.source || !this.props.source.url) && keyFigure.source) {
      return (
        <References title="Kilde" referenceList={[{
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
        <div className="row row-cols-1">
          <References title="Kilde" referenceList={[{
            href: this.props.source.url,
            label: this.props.source.title
          }]}/>
        </div>
      )
    }
    return
  }

  addHeader() {
    if (this.props.displayName) {
      return (
        <h4 className="mb-5">{this.props.displayName}</h4>
      )
    }
    return
  }

  render() {
    return <div className="container">
      {this.addHeader()}
      {this.createRows()}
      {this.addSource()}
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
  })
}

export default (props) => <KeyFigures {...props}/>
