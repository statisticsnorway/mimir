import React from 'react'
import { Button, Title, Link, LeadParagraph, Paragraph, Text } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Share2, Send, Smartphone, Eye, Download, ExternalLink } from 'react-feather'

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
    downloadPdfPhrase
  } = props

  console.log(props)

  const renderEmployeeDetails = () => {
    return (
      <div className="employee-details gx-0">
        <div>
          <Share2 size={30} transform='rotate(90)'/>
          <div>
            <div>{positionPhrase}</div>
            <span>{position}</span>
          </div>
        </div>
        <div>
          <Eye size={30} />
          <div>
            <div>{isResearcher ? researchAreaPhrase : departmentPhrase}</div>
            {area ? <Link href={area.href} linkType="profiled">{area.title}</Link> : null}
          </div>
        </div>
        <div>
          <Send size={30} />
          <div>
            <div>{emailPhrase}</div>
            {email ? <Link href={'mailto:' + email} linkType="profiled">{email}</Link> : null}
          </div>
        </div>
        <div>
          <Smartphone size={30} />
          <div>
            <div>{phonePhrase}</div>
            {phone ? <Link href={'tel:' + phone} linkType="profiled">{phone}</Link> : null}
          </div>
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
    return <ul>{projectList}</ul>
  }

  const calculateCvSize = (bytes) => {
    return Math.round(bytes / 1000)
  }

  return (
    <section className="xp-part employee container p-0 mb-5">
      <div className="row">
        <div className="employee-head gx-0">
          <div className="employee-image col-6 col-md-3"><img alt={`profilbilder av ${title}`} src={props.profileImages[0]} /></div>
          <div className="col-6 col-md-6"><Title size="1">{title}</Title></div>
        </div>
      </div>
      <div className="row">
        { renderEmployeeDetails() }
      </div>

      <div className="row">
        <div className="employee-attachments col-12 col-md-3">
          <div className="instructions">
            <h3>Pressbilder</h3>
            <p>Trykk på ønsket bilde for å åpne høyoppløselig versjon.</p>
          </div>
          <div className="row gx-0 profile-images-grid">
            {profileImages.map((href, i) => {
              return (
                <a href={href} target="_blank" type="media_type" className="image-column-size">
                  <div className="resized"><img alt={`profilbilder${i + 1} av ${title}`} src={href}/></div>
                  <div>
                    <Link linkType="profiled">Bilde{i + 1}.jpg</Link>
                  </div>
                </a>
              )
            })}
          </div>

          {myCV ? 
            <div className="downloadCv">
              <a href={myCV}><Button><Download size="18" /> &nbsp; {downloadPdfPhrase} ({calculateCvSize(cvInformation.size)} kB) </Button></a>
            </div> 
            : null
          }
        </div>

        <div className="col-12 col-md-6">
          <div className="row">
            <div className="employee-description">
              <div>
                <h2>{briefSummaryPhrase}</h2>
                <LeadParagraph>{description}</LeadParagraph>
              </div>
            </div>
          </div>
          {projects.length != 0 ? 
            <div className="row justify-content-center">
              <div className="employee-projects">
                <h2>{projectsPhrase}</h2>
                { renderProjects() }
              </div>
            </div>
            : null
          }
          {cristinId ?
            <div className="row justify-content-center">
              <div className="employee-publications">
                <h2>Publiseringer</h2>
              </div>
            </div>
            : null
          }
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
