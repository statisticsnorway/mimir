import React from 'react'
import { KeyFigures as SSBKeyFigures, References, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Alert, Button } from 'react-bootstrap'

class KeyFigures extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      showPreviewToggle: this.props.showPreviewDraft && (this.props.pageTypeKeyFigure || this.props.paramShowDraft && !this.props.pageTypeKeyFigure),
      fetchUnPublished: this.props.paramShowDraft,
      keyFigures: this.props.paramShowDraft && this.props.draftExist ? this.props.keyFiguresDraft : this.props.keyFigures
    }

    this.toggleDraft = this.toggleDraft.bind(this)
  }

  toggleDraft() {
    this.setState({
      fetchUnPublished: !this.state.fetchUnPublished,
      keyFigures: !this.state.fetchUnPublished && this.props.draftExist ? this.props.keyFiguresDraft : this.props.keyFigures
    })
  }

  addPreviewButton() {
    if (this.state.showPreviewToggle && this.props.pageTypeKeyFigure) {
      return (
        <Button
          variant="primary"
          onClick={this.toggleDraft}
          className="mb-4"
        >
          {!this.state.fetchUnPublished ? 'Vis upubliserte tall' : 'Vis publiserte tall'}
        </Button>
      )
    }
    return
  }

  addPreviewInfo() {
    const keyFigures = this.state.keyFigures

    if (this.props.showPreviewDraft) {
      if (this.state.fetchUnPublished) {
        return keyFigures.map((keyFigure) => {
          if (this.props.draftExist && keyFigure.number) {
            return (
              <Alert variant='info' className="mb-4">
                  Tallet i nøkkeltallet nedenfor er upublisert
              </Alert>
            )
          } else {
            return (
              <Alert variant='warning' className="mb-4">
                  Finnes ikke upubliserte tall for dette nøkkeltallet
              </Alert>
            )
          }
        })
      }
    }
    return
  }

  createRows() {
    const keyFigures = this.state.keyFigures
    const columns = this.props.columns

    let isRight = true
    return keyFigures.map((keyFigure, i) => {
      isRight = (!columns || (columns && !isRight) || keyFigure.size === 'large')
      return (
        <React.Fragment key={`figure-${i}`}>
          <div className={`col-12 ${columns && keyFigure.size !== 'large' ? 'col-md-6' : ''}`}>
            <SSBKeyFigures {...keyFigure} icon={keyFigure.iconUrl && <img src={keyFigure.iconUrl}
              alt={keyFigure.iconAltText ? keyFigure.iconAltText : ' '}></img>}/>
            {this.addKeyFigureSource(keyFigure)}
          </div>
          {i < keyFigures.length - 1 ? <Divider className={`my-5 d-block ${!isRight ? 'd-md-none' : ''}`} light /> : null}
        </React.Fragment>
      )
    })
  }

  addKeyFigureSource(keyFigure) {
    if ((!this.props.source || !this.props.source.url) && keyFigure.source && keyFigure.source.url) {
      const sourceLabel = this.props.sourceLabel

      return (
        <References className={`${keyFigure.size !== 'large' ? 'mt-3' : ''}`} title={sourceLabel} referenceList={[{
          href: keyFigure.source.url,
          label: keyFigure.source.title
        }]}/>
      )
    }
    return
  }

  addSource() {
    if (this.props.source && this.props.source.url) {
      const sourceLabel = this.props.sourceLabel

      return (
        <References className="col-12 mt-3" title={sourceLabel} referenceList={[{
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
    return (
      <section className="xp-part key-figures">
        <div className="d-none searchabletext">
          <span>{this.props.hiddenTitle}</span>
        </div>
        <div className="container">
          {this.addPreviewButton()}
          {this.addPreviewInfo()}
          {this.addHeader()}
          <div className="row">
            {this.createRows()}
            {this.addSource()}
          </div>
        </div>
      </section>
    )
  }
}

KeyFigures.propTypes = {
  displayName: PropTypes.string,
  keyFiguresDraft: PropTypes.arrayOf(
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
      sourceLabel: PropTypes.string,
      source: PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.title
      })
    })
  ),
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
      sourceLabel: PropTypes.string,
      source: PropTypes.shape({
        url: PropTypes.string,
        title: PropTypes.title
      })
    })
  ),
  sourceLabel: PropTypes.string,
  source: PropTypes.shape({
    url: PropTypes.string,
    title: PropTypes.title
  }),
  columns: PropTypes.bool,
  showPreviewDraft: PropTypes.bool,
  paramShowDraft: PropTypes.bool,
  draftExist: PropTypes.bool,
  pageTypeKeyFigure: PropTypes.bool,
  hiddenTitle: PropTypes.string
}

export default (props) => <KeyFigures {...props}/>
