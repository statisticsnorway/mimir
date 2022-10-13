import React from 'react'
import {Button, Title, Link, LeadParagraph, Paragraph, Accordion} from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import {Eye, Send, Share2, Smartphone, User, Calendar, Settings} from "react-feather";

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
        collaborators
    } = props
    console.log(typeof body);

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
            <div className="employee-details row">
                <div className="details-block col-4">
                    <User size={30}/>
                    <div>
                        <div>{projectType}</div>
                        <span>
                            <a className='ssb-link' href={manager.href}>
                            <span className='link-text'>{manager.text}</span>
                        </a>
                            </span>
                    </div>
                </div>
                <div className="details-block col-4">
                    <Calendar size={30}/>
                    <div>
                        <div>Periode</div>
                        <span>{projectPeriod}</span>
                    </div>
                </div>
                <div className="details-block col-4">
                    <Settings size={30}/>
                    <div>
                        <div>Finansiør</div>
                        <span>{financier}</span>
                    </div>
                </div>
            </div>
        )
    }
    const renderProjectDescription = () => {
        return (
            <div className="row">
                <div className="col-12 col-md-12 row-gutter-mobile">
                    <h2 className="title-max-width ssb-title center top-padding">Om prosjektet</h2>
                </div>
                <div className="col-12 col-md-12 row-gutter-mobile">
                    <div className="ssb-lead-paragraph center"
                         dangerouslySetInnerHTML={{
                             __html: ingress
                         }}
                    />
                </div>
                <div className="col-12 col-md-12 row-gutter-mobile mt-3">
                    <div className="ssb-lead-paragraph center"
                         dangerouslySetInnerHTML={{
                             __html: body
                         }}
                    />
                </div>
            </div>
        )
    }

    const renderParticipantAccordion = () => {
        return (
            <div className="row">
                <div className="col-7 col-md-7 row-gutter-mobile center">
                    <h2 className="title-max-width ssb-title padding-top">Deltakere</h2>
                    <Accordion header='Prosjektdeltakere' className="employee-attachments">
                        <div className="ssb-paragraph lh-lg"
                             dangerouslySetInnerHTML={{
                                 __html: participants
                             }}
                        />
                    </Accordion>
                    <Accordion header='Samarbeidspartnere' className="employee-attachments" style={{width: '60%'}}>
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

    return (
        <div className='project'>
            <section className="xp-part employee container p-0 mb-5">
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
    collaborators: PropTypes.string
}

export default (props) => <Project {...props} />

