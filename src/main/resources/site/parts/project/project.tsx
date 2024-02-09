import React from 'react'
import { Title, Accordion, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { User, Calendar, Settings } from 'react-feather'

const Project = (props) => {
  const {
    introTitle,
    projectTitle,
    manager,
    projectType,
    projectPeriod,
    financier,
    heading,
    ingress,
    body,
    participants,
    collaborators,
    periodPhrase,
    financierPhrase,
    participantsPhrase,
    projectParticipantsPhrase,
    collaboratorsPhrase,
  } = props

  const renderTitle = () => {
    return (
      <div className='col-12 col-lg-12 mb-4'>
        <div className='info-text searchabletext mb-1'>{introTitle}</div>
        <Title className='ssb-title searchabletext' size='3'>
          {projectTitle}
        </Title>
      </div>
    )
  }

  const renderProjectInfo = () => {
    if (manager) {
      return (
        <div className='col-12 project-details pb-2 pe-0'>
          <div className='row w-100'>
            <div className='col-lg col-12 py-4 details-block'>
              <div>
                <User size={30} />
              </div>
              <div>
                <div className='info-text'>{projectType}</div>
                <Link className='detail-info' href={manager.href}>
                  {manager.text}
                </Link>
              </div>
            </div>
            <div className='col-lg col-12 py-4 details-block'>
              <div>
                <Calendar size={30} />
              </div>
              <div>
                <div className='info-text'>{periodPhrase}</div>
                <div className='detail-info'>{projectPeriod}</div>
              </div>
            </div>
            <div className='col-lg col-12 py-4 details-block'>
              <div>
                <Settings size={30} />
              </div>
              <div>
                <div className='info-text'>{financierPhrase}</div>
                <div className='detail-info'>{financier}</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }
  const renderProjectDescription = () => {
    if (ingress || body) {
      return (
        <div className='row center'>
          <div className='col-12 col-md-12 row-gutter-mobile'>
            <h2 className='ssb-title pb-3 pt-5'>{heading}</h2>
          </div>
          <div className='col-12 col-md-12 row-gutter-mobile'>
            <p className='project-ingress'>{ingress}</p>
            <div
              className='project-paragraph'
              dangerouslySetInnerHTML={{
                __html: body,
              }}
            />
          </div>
        </div>
      )
    }
  }

  const renderParticipantAccordion = () => {
    if (participants || collaborators) {
      return (
        <div className='row center mt-5'>
          <div className='col-12 col-md-12 row-gutter-mobile'>
            <h2 className='mw-680 ssb-title pb-3'>{participantsPhrase}</h2>
            <Accordion header={projectParticipantsPhrase} className={`${!participants ? 'd-none' : ''}`}>
              <div
                className='ssb-paragraph lh-lg'
                dangerouslySetInnerHTML={{
                  __html: participants,
                }}
              />
            </Accordion>
            <Accordion
              header={collaboratorsPhrase}
              className={`${!collaborators ? 'd-none' : ''}`}
              style={{
                width: '60%',
              }}
            >
              <div
                className='ssb-paragraph lh-lg'
                dangerouslySetInnerHTML={{
                  __html: collaborators,
                }}
              />
            </Accordion>
          </div>
        </div>
      )
    }
  }

  return (
    <section className='xp-part container p-0 mb-5'>
      <div className='row project row-gutter-desktop'>
        {renderTitle()}
        {renderProjectInfo()}
        {renderProjectDescription()}
        {renderParticipantAccordion()}
      </div>
    </section>
  )
}

Project.propTypes = {
  introTitle: PropTypes.string,
  projectTitle: PropTypes.string,
  manager: PropTypes.string,
  projectType: PropTypes.string,
  projectPeriod: PropTypes.string,
  financier: PropTypes.string,
  heading: PropTypes.string,
  ingress: PropTypes.string | undefined,
  body: PropTypes.string,
  participants: PropTypes.string,
  collaborators: PropTypes.string,
  periodPhrase: PropTypes.string,
  financierPhrase: PropTypes.string,
  participantsPhrase: PropTypes.string,
  projectParticipantsPhrase: PropTypes.string,
  collaboratorsPhrase: PropTypes.string,
}

export default (props) => <Project {...props} />
