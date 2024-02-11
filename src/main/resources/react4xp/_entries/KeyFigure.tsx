import React from 'react'
import {
  Title,
  Button,
  KeyFigures as SSBKeyFigures,
  References,
  Divider,
} from '@statisticsnorway/ssb-component-library'
import { Alert, Row, Col } from 'react-bootstrap'

interface KeyFiguresProps {
  displayName?: string;
  keyFiguresDraft?: {
    iconUrl?: string;
    iconAltText?: string;
    number?: string;
    numberDescription?: string;
    noNumberText?: string;
    size?: string;
    title?: string;
    time?: string;
    changes?: {
      changeDirection?: string;
      changeText?: string;
      changePeriod?: string;
    };
    glossary?: string;
    greenBox?: boolean;
    source?: {
      url?: string;
      title?: string;
    };
  }[];
  keyFigures?: {
    iconUrl?: string;
    iconAltText?: string;
    number?: string;
    numberDescription?: string;
    noNumberText?: string;
    size?: string;
    title?: string;
    time?: string;
    changes?: {
      changeDirection?: string;
      changeText?: string;
      changePeriod?: string;
    };
    glossary?: string;
    greenBox?: boolean;
    source?: {
      url?: string;
      title?: string;
    };
  }[];
  sourceLabel?: string;
  source?: {
    url?: string;
    title?: string;
  };
  columns?: boolean;
  showPreviewDraft?: boolean;
  paramShowDraft?: boolean;
  draftExist?: boolean;
  pageTypeKeyFigure?: boolean;
  hiddenTitle?: string;
  isInStatisticsPage?: boolean;
}

class KeyFigures extends React.Component<KeyFiguresProps> {
  constructor(props) {
    super(props)

    this.state = {
      showPreviewToggle:
        this.props.showPreviewDraft &&
        (this.props.pageTypeKeyFigure || (this.props.paramShowDraft && !this.props.pageTypeKeyFigure)),
      fetchUnPublished: this.props.paramShowDraft,
      keyFigures:
        this.props.paramShowDraft && this.props.draftExist ? this.props.keyFiguresDraft : this.props.keyFigures,
    }

    this.toggleDraft = this.toggleDraft.bind(this)
  }

  toggleDraft() {
    this.setState({
      fetchUnPublished: !this.state.fetchUnPublished,
      keyFigures:
        !this.state.fetchUnPublished && this.props.draftExist ? this.props.keyFiguresDraft : this.props.keyFigures,
    })
  }

  addPreviewButton() {
    if (this.state.showPreviewToggle && this.props.pageTypeKeyFigure) {
      return (
        <Col>
          <Button primary onClick={this.toggleDraft} className='mb-4'>
            {!this.state.fetchUnPublished ? 'Vis upubliserte tall' : 'Vis publiserte tall'}
          </Button>
        </Col>
      )
    }
    return
  }

  addPreviewInfo() {
    const keyFigures = this.state.keyFigures

    if (this.props.showPreviewDraft) {
      if (this.state.fetchUnPublished) {
        return keyFigures.map((keyFigure, i) => {
          const unpublishedDraft = this.props.draftExist && keyFigure.number
          return (
            <Col
              key={`${keyFigure.number || keyFigure.title}${i}`}
              className={`col-12${this.props.isInStatisticsPage ? ' p-0' : ''}`}
            >
              <Alert variant={unpublishedDraft ? 'info' : 'warning'} className='mb-4'>
                {unpublishedDraft
                  ? 'Tallet i nøkkeltallet nedenfor er upublisert'
                  : 'Finnes ikke upubliserte tall for dette nøkkeltallet'}
              </Alert>
            </Col>
          )
        })
      }
    }
  }

  createRows() {
    const keyFigures = this.state.keyFigures
    const columns = this.props.columns

    let isRight = true
    return keyFigures.map((keyFigure, i) => {
      isRight = !columns || (columns && !isRight) || keyFigure.size === 'large'
      return (
        <React.Fragment key={`figure-${i}`}>
          <Col
            className={`col-12${columns && keyFigure.size !== 'large' ? ' col-md-6' : ''}${
              this.props.isInStatisticsPage ? ' p-0' : ''
            }`}
          >
            <SSBKeyFigures
              {...keyFigure}
              icon={
                keyFigure.iconUrl && (
                  <img src={keyFigure.iconUrl} alt={keyFigure.iconAltText ? keyFigure.iconAltText : ''}></img>
                )
              }
            />
            {this.addKeyFigureSource(keyFigure)}
          </Col>
          {i < keyFigures.length - 1 ? (
            <Divider className={`my-5 d-block ${!isRight ? 'd-md-none' : ''}`} light />
          ) : null}
        </React.Fragment>
      )
    })
  }

  addKeyFigureSource(keyFigure) {
    if ((!this.props.source || !this.props.source.url) && keyFigure.source && keyFigure.source.url) {
      const sourceLabel = this.props.sourceLabel

      return (
        <References
          className={`${keyFigure.size !== 'large' ? 'mt-3' : ''}`}
          title={sourceLabel}
          referenceList={[
            {
              href: keyFigure.source.url,
              label: keyFigure.source.title,
            },
          ]}
        />
      )
    }
    return
  }

  addSource() {
    if (this.props.source && this.props.source.url) {
      const sourceLabel = this.props.sourceLabel

      return (
        <Col className='col-12'>
          <References
            className='col-12 mt-3'
            title={sourceLabel}
            referenceList={[
              {
                href: this.props.source.url,
                label: this.props.source.title,
              },
            ]}
          />
        </Col>
      )
    }
    return
  }

  addHeader() {
    if (this.props.displayName) {
      return (
        <Col>
          <Title size={3} className='mb-5'>
            {this.props.displayName}
          </Title>
        </Col>
      )
    }
    return
  }

  render() {
    return (
      <React.Fragment>
        <Row className='d-none searchabletext'>
          <Col className='col-12'>{this.props.hiddenTitle}</Col>
        </Row>
        <Row>
          {this.addPreviewButton()}
          {this.addPreviewInfo()}
          {this.addHeader()}
        </Row>
        <Row className={`${this.props.isInStatisticsPage && 'mt-1 mb-5 mt-lg-0'}`}>
          {this.createRows()}
          {this.addSource()}
        </Row>
      </React.Fragment>
    )
  }
}

export default (props) => <KeyFigures {...props} />
