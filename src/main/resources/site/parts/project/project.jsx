import React from 'react'
import {Title, Accordion} from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import {User, Calendar, Settings} from "react-feather";

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
        collaboratorsPhrase,
        publicationsPhrase
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
            <div className="project-details row">
                <div className="details-block">
                    <User size={30}/>
                    <div>
                        <div>{projectType}</div>
                        <a className='ssb-link' href={manager.href}>
                            <span>{manager.text}</span>
                        </a>
                    </div>
                </div>
                <div className="details-block">
                    <Calendar size={30}/>
                    <div>
                        <div>{periodPhrase}</div>
                        <span>{projectPeriod}</span>
                    </div>
                </div>
                <div className="details-block">
                    <Settings size={30}/>
                    <div>
                        <div>{financierPhrase}</div>
                        <span>{financier}</span>
                    </div>
                </div>
            </div>
        )
    }
    const renderProjectDescription = () => {
        if (ingress || body) {
            return (
                <div className="row">
                    <div className="col-12 col-md-12 row-gutter-mobile">
                        <h2 className="title-max-width ssb-title center title-padding">{aboutPhrase}</h2>
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
                <div className="row">
                    <div className="col-7 col-md-7 row-gutter-mobile center">
                        <h2 className="title-max-width ssb-title top-padding">{participantsPhrase}</h2>
                        <Accordion header={projectParticipantsPhrase}
                                   className={`${!participants ? 'hide-empty-block' : ''}`}>
                            <div className="ssb-paragraph lh-lg"
                                 dangerouslySetInnerHTML={{
                                     __html: participants
                                 }}
                            />
                        </Accordion>
                        <Accordion header={collaboratorsPhrase}
                                   className={`${!collaborators ? 'hide-empty-block' : ''}`} style={{width: '60%'}}>
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
    publicationsPhrase: PropTypes.string,
}

export default (props) => <Project {...props} />

