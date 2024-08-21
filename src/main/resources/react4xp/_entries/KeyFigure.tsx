import React, { useState } from 'react'
import {
  Title,
  Button,
  KeyFigures as SSBKeyFigures,
  References,
  Divider,
} from '@statisticsnorway/ssb-component-library'
import { Alert, Row, Col } from 'react-bootstrap'
import { type KeyFigureData, type KeyFigureProps } from '../../lib/types/partTypes/keyFigure'

function KeyFigures(props: KeyFigureProps) {
  const {
    showPreviewDraft,
    pageTypeKeyFigure,
    paramShowDraft,
    draftExist,
    keyFiguresDraft,
    keyFigures,
    columns,
    isMacro,
    isInStatisticsPage,
    source,
    sourceLabel,
    displayName,
    hiddenTitle,
  } = props
  const showPreviewToggle = showPreviewDraft && (pageTypeKeyFigure || (paramShowDraft && !pageTypeKeyFigure))

  const [fetchUnPublished, setFetchUnPublished] = useState(paramShowDraft)
  const [keyFiguresList, setKeyFiguresList] = useState((paramShowDraft && draftExist ? keyFiguresDraft : keyFigures)!)

  function toggleDraft() {
    setFetchUnPublished(!fetchUnPublished)
    setKeyFiguresList((!fetchUnPublished && draftExist ? keyFiguresDraft : keyFigures)!)
  }

  function addPreviewButton() {
    if (showPreviewToggle && pageTypeKeyFigure) {
      return (
        <Col>
          <Button primary onClick={toggleDraft} className='mb-4'>
            {!fetchUnPublished ? 'Vis upubliserte tall' : 'Vis publiserte tall'}
          </Button>
        </Col>
      )
    }
    return
  }

  function addPreviewInfo() {
    if (showPreviewDraft) {
      if (fetchUnPublished) {
        return keyFiguresList.map((keyFigure, i) => {
          const unpublishedDraft = draftExist && keyFigure.number
          return (
            <Col
              key={`${keyFigure.number || keyFigure.title}${i}`}
              className={`col-12${isInStatisticsPage ? ' p-0' : ''}`}
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
      return
    }
    return
  }

  function createRows() {
    let isRight = true
    return keyFiguresList.map((keyFigure, i) => {
      isRight = !columns || (columns && !isRight) || keyFigure.size === 'large'
      return (
        <React.Fragment key={`figure-${i}`}>
          {isMacro && !keyFigure.greenBox ? addDivider(isRight) : null}
          <Col
            className={`col-12${columns && keyFigure.size !== 'large' ? ' col-md-6' : ''}${
              isInStatisticsPage ? ' p-0' : ''
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
            {addKeyFigureSource(keyFigure)}
          </Col>
          {i < keyFiguresList.length - 1 ? addDivider(isRight) : null}
          {isMacro && !keyFigure.greenBox ? addDivider(isRight) : null}
        </React.Fragment>
      )
    })
  }

  function addDivider(isRight: boolean) {
    return <Divider className={`my-5 d-block ${!isRight ? 'd-md-none' : ''}`} light />
  }

  function addKeyFigureSource(keyFigure: KeyFigureData) {
    if ((!source || !source.url) && keyFigure.source && keyFigure.source.url) {
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

  function addSource() {
    if (source && source.url) {
      return (
        <Col className='col-12'>
          <References
            className='col-12 mt-3'
            title={sourceLabel}
            referenceList={[
              {
                href: source.url,
                label: source.title,
              },
            ]}
          />
        </Col>
      )
    }
    return
  }

  function addHeader() {
    if (displayName) {
      return (
        <Col>
          <Title size={3} className='mb-5'>
            {displayName}
          </Title>
        </Col>
      )
    }
    return
  }

  return (
    <>
      <Row className='d-none searchabletext'>
        <Col className='col-12'>{hiddenTitle}</Col>
      </Row>
      <Row>
        {addPreviewButton()}
        {addPreviewInfo()}
        {addHeader()}
      </Row>
      <Row className={`${isInStatisticsPage && 'mt-1 mb-5 mt-lg-0'}`}>
        {createRows()}
        {addSource()}
      </Row>
    </>
  )
}

export default (props: KeyFigureProps) => <KeyFigures {...props} />
