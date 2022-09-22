import React from 'react';
import { Button, Title, Link, LeadParagraph, Paragraph, Text, Accordion } from '@statisticsnorway/ssb-component-library';
import PropTypes from 'prop-types';
import { Share2, Send, Smartphone, Eye, Download, Image } from 'react-feather';

const Employee = (props) => {
  const {
    title, email, position, phone, description, profileImages, myCV, projects, isResearcher, cristinId, area, cvInformation,
    emailPhrase,
    phonePhrase,
    positionPhrase,
    researchAreaPhrase,
    departmentPhrase,
    briefSummaryPhrase,
    projectsPhrase,
    downloadPdfPhrase, 
    publicationsPhrase,
    pressPicturesPhrase,
    pressPicturesDescrPhrase, 
    imagePhrase,
  } = props;

  const calculateCvSize = (bytes) => {
    return Math.round(bytes / 1000)
  }

  const renderPortraitImages = () => {
    return (
      <div className="grid-row">
        {profileImages.map((href, i) => {
          return (
            <div key={i} className="grid-column" role="img" aria-label={`${pressPicturesPhrase} ${i + 1} av ${title}`}>
              <a href={href} target="_blank" type="media_type">
                <div><img alt={`${pressPicturesPhrase} ${i + 1} av ${title}.`} src={href}/></div>
                <div><Link linkType="profiled">{imagePhrase} {i + 1}.jpg</Link></div>
              </a>
            </div>
          )
        })}
      </div>
    )
  }

  const downloadPDF = (url) => {
    const link = document.createElement("a");
    link.href = url;
    link.click();
  }

  const renderDownloadCvButton = () => {
    return (
      myCV ? 
        <div className="downloadCv">
          <Button onClick={() => downloadPDF(myCV)}><Download size="18" /> &nbsp; {downloadPdfPhrase} ({calculateCvSize(cvInformation.size)} kB) </Button>
        </div> 
        : null
    )
  }

  const renderEmployeeHead = () => {
    return (
      <div className="employee-head">
        <div className="employee-image col-6 col-md-3"><img alt={`profilbilder av ${title}`} src={props.profileImages[0]} /></div>
        <div className="col-6 col-md-6"><Title size="1">{title}</Title></div>
      </div>
    )
  }

  const renderEmployeeDetails = () => {
    return (
      <div className="employee-details">
        <div className="details-block">
          <Share2 size={30} transform='rotate(90)'/>
          <div>
            <div>{positionPhrase}</div>
            <span>{position}</span>
          </div>
        </div>
        <div className="details-block">
          <Eye size={30} />
          <div>
            <div>{isResearcher ? researchAreaPhrase : departmentPhrase}</div>
            {area ? <Link href={area.href} linkType="profiled">{area.title}</Link> : null}
          </div>
        </div>
        <div className="details-block">
          <Send size={30} />
          <div>
            <div>{emailPhrase}</div>
            {email ? <Link href={'mailto:' + email} linkType="profiled">{email}</Link> : null}
          </div>
        </div>
        <div className="details-block">
          <Smartphone size={30} />
          <div>
            <div>{phonePhrase}</div>
            {phone ? <Link href={'tel:' + phone} linkType="profiled">{phone}</Link> : null}
          </div>
        </div>
      </div>
    )
  }
  
  const renderAttachmentsForDesktop = () => {
    return (
      <aside className="employee-attachments mobile-display-none col-12 col-md-3" role="complementary">
        <div className="instructions">
          <h2>{pressPicturesPhrase}</h2>
          <p>{pressPicturesDescrPhrase}</p>
        </div>
        {renderPortraitImages()}
        {renderDownloadCvButton()}   
      </aside>
    )
  }

  const renderAttachmentsForMobile = () => {
    return (
      <div className="row desktop-display-none">
        <Accordion header={pressPicturesPhrase} className="employee-attachments">
          <div className="instructions">
            <p>{pressPicturesDescrPhrase}</p>
          </div>
          {renderPortraitImages()}
        </Accordion>
      </div>
    )
  } 

  const renderEmployeeDescription = () => {
    return (
      <div className="row">
        <div className="employee-description">
          <div>
            <h2>{briefSummaryPhrase}</h2>
            <LeadParagraph>{description}</LeadParagraph>
          </div>
          <div className="desktop-display-none">{renderDownloadCvButton()}</div>
        </div>
      </div>
    )
  }

  const renderProjects = () => {
    const projectList = projects.map((project, i) => {
      return (      
        <li key={i}>
          <Link href={project.href} linkType="header">{project.title}</Link>
          <Paragraph>{project.description}</Paragraph>
        </li>     
      )
    })
    return ( 
      <div className="row justify-content-center">
        <div className="employee-projects">
          <h2>{projectsPhrase}</h2>
          <ul>{projectList}</ul>
        </div>
      </div>
    )
  }

  const renderPublications = () => {
    return (
      <div className="row justify-content-center">
        <div className="employee-publications">
          <h2>{publicationsPhrase}</h2>
        </div>
      </div>
    )
  }

  return (
    <section className="xp-part employee container p-0 mb-5">
      <div className="row">
        {renderEmployeeHead()}
      </div>

      <div className="row">
        {renderEmployeeDetails()}
      </div>

      <div className="row">
        {renderAttachmentsForDesktop()}
        {renderAttachmentsForMobile()}

        <div className="col-12 col-md-6">
          {renderEmployeeDescription()}
          {projects.length != 0 ? renderProjects(): null}
          {cristinId ? renderPublications : null}
        </div>
      </div>
    </section>
  )
}

Employee.propTypes = {
  title: PropTypes.string,
  email: PropTypes.string,
  position: PropTypes.string,
  phone: PropTypes.string,
  description: PropTypes.string,
  profileImages: PropTypes.array,
  myCV: PropTypes.string,
  projects: PropTypes.array,
  area: PropTypes.object,
  isResearcher: PropTypes.bool,
  cristinId: PropTypes.string | null,
  emailPhrase: PropTypes.string,
  phonePhrase: PropTypes.string,
  positionPhrase: PropTypes.string,
  researchAreaPhrase: PropTypes.string,
  departmentPhrase: PropTypes.string,
  briefSummaryPhrase: PropTypes.string,
  projectsPhrase: PropTypes.string
}

export default (props) => <Employee {...props} />
