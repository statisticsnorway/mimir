import React from 'react'
import {Title, Accordion, Link} from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import {User, Calendar, Settings} from 'react-feather';

const Project = (props) => {
    const {
        projectTitle,
        manager,
        projectType,
        projectPeriod,
        financier,
        ingress,
        body,
        participants,
        collaborators,
        periodPhrase,
        financierPhrase,
        aboutPhrase,
        participantsPhrase,
        projectParticipantsPhrase,
        collaboratorsPhrase
    } = props

    const renderTitle = () => {
        return (
            <div className="row">
                <Title className="col-12" size='3'>
                    {projectTitle}
                </Title>
            </div>
        )
    }

    const renderProjectInfo = () => {
        return (
            <div className="row project-details py-4">
                <div className="col-md-4 col-sm-12 py-4 details-block">
                    <div>
                        <User size={30}/>
                        <span className="p-1">{projectType}</span>
                        <div>
                          <Link className='ms-4 ms-sm-4 detail-info' href={manager.href}>{manager.text}</Link>
                        </div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-12 py-4 details-block">
                    <div>
                        <Calendar size={30}/>
                        <span className="p-1">{periodPhrase}</span>
                        <div className="detail-info ps-4">{projectPeriod}</div>
                    </div>
                </div>
                <div className="col-md-4 col-sm-12 py-4 details-block">
                    <div>
                        <Settings size={30}/>
                        <span className="p-1">{financierPhrase}</span>
                        <div className="detail-info ps-4">{financier}</div>
                    </div>
                </div>
            </div>
        )
    }
    const renderProjectDescription = () => {
        if (ingress || body) {
            return (
                <div className="row center">
                    <div className="col-12 col-md-12 row-gutter-mobile">
                        <h2 className="ssb-title py-4">{aboutPhrase}</h2>
                    </div>
                    <div className="col-12 col-md-12 row-gutter-mobile">
                        <div className="project-ingress"
                             dangerouslySetInnerHTML={{
                                 __html: ingress
                             }}
                        />
                    </div>
                    <div className="col-12 col-md-12 row-gutter-mobile">
                        <div className="project-paragraph"
                             dangerouslySetInnerHTML={{
                                 __html: body
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
                <div className="row center">
                    <div className="col-12 col-md-12 row-gutter-mobile center-accordion">
                        <h2 className="mw-680 ssb-title top-padding">{participantsPhrase}</h2>
                        <Accordion header={projectParticipantsPhrase}
                                   className={`${!participants ? 'd-none' : ''}`}>
                            <div className="ssb-paragraph lh-lg"
                                 dangerouslySetInnerHTML={{
                                     __html: participants
                                 }}
                            />
                        </Accordion>
                        <Accordion header={collaboratorsPhrase}
                                   className={`${!collaborators ? 'd-none' : ''}`} style={{width: '60%'}}>
                            <div className="ssb-paragraph lh-lg"
                                 dangerouslySetInnerHTML={{
                                     __html: collaborators
                                 }}
                            />
                        </Accordion>
                    </div>
                </div>
            )
        }
    }

    return (
        <div className='project'>
                <section className="xp-part container p-0 mb-5">
                {renderTitle()}
                {renderProjectInfo()}
                {renderProjectDescription()}
                {renderParticipantAccordion()}
            </section>
        </div>
    )
}

Project.propTypes = {
    projectTitle: PropTypes.string,
    manager: PropTypes.string,
    projectType: PropTypes.string,
    projectPeriod: PropTypes.string,
    financier: PropTypes.string,
    ingress: PropTypes.string | undefined,
    body: PropTypes.string,
    participants: PropTypes.string,
    collaborators: PropTypes.string,
    periodPhrase: PropTypes.string,
    financierPhrase: PropTypes.string,
    aboutPhrase: PropTypes.string,
    participantsPhrase: PropTypes.string,
    projectParticipantsPhrase: PropTypes.string,
    collaboratorsPhrase: PropTypes.string,
}

export default (props) => <Project {...props} />
