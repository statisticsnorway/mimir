import React from 'react'
import { Button, Title, Link, LeadParagraph, Paragraph, Accordion } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Share2, Send, Smartphone, Eye, Home, Download, Image } from 'react-feather'

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
    profilePicturePhrase
  } = props

  const calculateCvSize = (bytes) => {
    return Math.round(bytes / 1000)
  }

  const sanitizeMobileNo = (number) => {
    const spacesRemoved = number.split(' ').join('')
    const numberMatchesInTwo = spacesRemoved.match(/.{1,2}/g)
    return numberMatchesInTwo.join(' ')
  }

  const renderPortraitImages = () => {
    return (
      <div className="grid-row">
        {profileImages.map((href, i) => {
          return (
            <div key={i} className="grid-column" role="img" aria-label={`${pressPicturesPhrase} ${i + 1} av ${title}`}>
              <a href={href} target="_blank" rel="noreferrer" type="media_type">
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
    const link = document.createElement('a')
    link.href = url
    link.click()
  }

  const renderDownloadCvButton = () => {
    return (
      myCV ?
        <div className="downloadCv">
          <Button onClick={() => downloadPDF(myCV)}><Download size="24" />{downloadPdfPhrase} ({calculateCvSize(cvInformation.size)} kB)</Button>
        </div> : null
    )
  }

  const renderEmployeeHead = () => {
    return (
      <div className="employee-head col-12">
        {profileImages.length != 0 ?
          <div className="employee-image">
            <img alt={`${profilePicturePhrase} ${title}`} src={props.profileImages[0]} />
          </div> : null}
        <div className="employee-title"><Title size="1">{title}</Title></div>
      </div>
    )
  }

  const renderEmployeeDetails = () => {
    const widthRatio = position && email && phone ?
      '24%' : position && email || phone ?
        '32%' : position ?
          '48%' : '100%'

    return (
      <div className="employee-details">
        {
          position ?
            <div className="details-block" style={{
              width: widthRatio
            }}>
              <div><Share2 size={24} transform='rotate(90)' /></div>
              <div>
                <div>{positionPhrase}</div>
                <div className="position-text">{position}</div>
              </div>
            </div> :
            null
        }
        { area ?
          <div className="details-block" style={{
            width: widthRatio
          }}>
            <div>{isResearcher ? <Eye size={24} /> : <Home size={24} />}</div>
            <div>
              <div>{isResearcher ? researchAreaPhrase : departmentPhrase}</div>
              <Link href={area.href} linkType="profiled">{area.title}</Link>
            </div>
          </div> :
          null
        }
        {
          email ?
            <div className="details-block" style={{
              width: widthRatio
            }}>
              <div><Send size={24} /></div>
              <div>
                <div>{emailPhrase}</div>
                <Link href={'mailto:' + email} linkType="profiled">{email}</Link>
              </div>
            </div> :
            null
        }
        {
          phone ?
            <div className="details-block" style={{
              width: widthRatio
            }}>
              <div><Smartphone size={24} /></div>
              <div>
                <div>{phonePhrase}</div>
                <Link href={'tel:' + phone} linkType="profiled">{sanitizeMobileNo(phone)}</Link>
              </div>
            </div> :
            null
        }
      </div>
    )
  }

  const renderAttachmentsForDesktop = () => {
    return (
      <aside className="employee-attachments mobile-display-none col-12 col-md-3" role="complementary">
        <div className="instructions">
          <h3>{pressPicturesPhrase}</h3>
          <p>{pressPicturesDescrPhrase}</p>
        </div>
        {renderPortraitImages()}
        {renderDownloadCvButton()}
      </aside>
    )
  }

  const renderAttachmentsForMobile = () => {
    const accordionHeader = (
      <React.Fragment>
        <Image size={24} /> {pressPicturesPhrase}
      </React.Fragment>
    )

    return (
      <div className="row desktop-display-none">
        <Accordion header={accordionHeader} className="employee-attachments">
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

      <div className="row row-gutter-desktop">
        {renderEmployeeDetails()}
      </div>

      <div className="row row-gutter-desktop">
        {profileImages.length != 0 ? renderAttachmentsForDesktop() : null}
        {profileImages.length != 0 ? renderAttachmentsForMobile() : null}

        <div className="col-12 col-md-6 row-gutter-mobile">
          {description ? renderEmployeeDescription() : null}
          {projects.length != 0 ? renderProjects() : null}
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
  cvInformation: PropTypes.object,
  isResearcher: PropTypes.bool,
  cristinId: PropTypes.string | null,
  emailPhrase: PropTypes.string,
  phonePhrase: PropTypes.string,
  positionPhrase: PropTypes.string,
  researchAreaPhrase: PropTypes.string,
  departmentPhrase: PropTypes.string,
  briefSummaryPhrase: PropTypes.string,
  projectsPhrase: PropTypes.string,
  downloadPdfPhrase: PropTypes.string,
  publicationsPhrase: PropTypes.string,
  pressPicturesPhrase: PropTypes.string,
  pressPicturesDescrPhrase: PropTypes.string,
  imagePhrase: PropTypes.string,
  profilePicturePhrase: PropTypes.string
}

export default (props) => <Employee {...props} />
