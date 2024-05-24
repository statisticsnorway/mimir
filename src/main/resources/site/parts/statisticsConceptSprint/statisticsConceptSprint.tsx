import React, { useState } from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import { Divider, ButtonTertiary, Button } from '@statisticsnorway/ssb-component-library'
import { type StatisticsPropsConceptSprint } from '../../../lib/types/partTypes/statisticsConceptSprint'

function StatisticsConceptSprint(props: StatisticsPropsConceptSprint) {
  const { title, ingress, nextRelease, nextUpdate, updated, previousRelease } = props
  const [isHidden, setIsHidden] = useState(true)

  function toggleBox() {
    setIsHidden((prevState) => !prevState)
  }

  function renderShowMoreButtonNew() {
    return (
      <div className={`row mt-5 hide-show-btn justify-content-center}`}>
        <div className='col-auto'>
          <Button onClick={toggleBox}>{getButtonText()}</Button>
        </div>
      </div>
    )
  }
  function getButtonText() {
    if (isHidden) {
      return <span>Vis mer</span>
    }
    return <span>Lukk</span>
  }

  function renderContent() {
    return (
      <Row className='mt-3'>
        <Container>
          <Row>
            <span>Her kommer mer informasjon om datoene</span>
          </Row>
        </Container>
      </Row>
    )
  }

  return (
    <section className='xp-part statistics  concept-sprint'>
      <Row>
        <Container className=' h-100 banner'>
          <Row>
            <div className='col-12'>
              <div className='subtitle mb-3 roboto-plain position-relative' aria-hidden='true'>
                Statistikk om
              </div>
              <h1 className='mt-0 pt-0 position-relative' aria-hidden='true'>
                {title}
              </h1>
            </div>
          </Row>
        </Container>
        <div className='col-md-8 col-12'>
          <p className='ingress-wrapper searchabletext'>{ingress}</p>
        </div>
        <div className='col-12'>
          <div className='titles-dates-wrapper flex-container'>
            <p className='updatedDate col-md-6 col-12 flex-item'>
              <span className='fw-bold'>{updated}</span>
              <span>{previousRelease}</span>
            </p>
            <p className='nextUpdateDate  col-md-6 col-12 flex-item align-right'>
              <span className='fw-bold'>{nextUpdate}</span>
              <span data-th-text='${nextRelease}'>{nextRelease}</span>
            </p>
          </div>
          <Divider />
          {!isHidden && renderContent()}
          {renderShowMoreButtonNew()}
        </div>
      </Row>
    </section>
  )
}

export default (props: StatisticsPropsConceptSprint) => <StatisticsConceptSprint {...props} />
