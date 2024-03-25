import React from 'react'
import { Button, Title, Link, Paragraph, Accordion } from '@statisticsnorway/ssb-component-library'
import { Share2, Send, Smartphone, Eye, Home, Download, Image } from 'react-feather'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import { EmployeeProps } from '../../../lib/types/partTypes/employee'

const Employee = (props: EmployeeProps) => {
  const {
    title,
    email,
    position,
    phone,
    description,
    profileImages,
    myCV,
    projects,
    isResearcher,
    cristinId,
    area,
    cvInformation,
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
    pressPictureLabelPhrase,
    imagePhrase,
  } = props

  const calculateCvSize = (bytes: number) => {
    return Math.round(bytes / 1000)
  }

  const sanitizeMobileNo = (number: string) => {
    const spacesRemoved = number.split(' ').join('')
    const numberMatchesInTwo = spacesRemoved.match(/.{1,2}/g)
    return numberMatchesInTwo?.join(' ')
  }

  const renderPortraitImages = () => {
    return (
      <div className='grid-row'>
        {profileImages.map((href, i) => {
          const pressPictureNumber = i + 1
          const pressPicturePhrase = pressPictureLabelPhrase.replace('{0}', pressPictureNumber.toString())
          return (
            <div key={i} className='grid-column'>
              <a href={href} target='_blank' rel='noreferrer' type='image/jpeg' aria-label={pressPicturePhrase}>
                <div className='press-picture-thumbnail'>
                  <img alt='' src={href} />
                </div>
                <div className='ssb-link profiled' aria-hidden='true'>
                  <span className='link-text'>
                    {imagePhrase} {pressPictureNumber}.jpg
                  </span>
                </div>
              </a>
            </div>
          )
        })}
      </div>
    )
  }

  const downloadPDF = (url: string | null) => {
    const link = document.createElement('a')
    link.href = url || ''
    link.click()
  }

  const renderDownloadCvButton = () => {
    return (
      <div className='downloadCv'>
        <Button onClick={() => downloadPDF(myCV)}>
          <Download size='24' aria-hidden='true' />
          {downloadPdfPhrase} ({calculateCvSize(cvInformation.size)} kB)
        </Button>
      </div>
    )
  }

  const renderEmployeeHead = () => {
    return (
      <div className='employee-head col-12'>
        {profileImages.length != 0 ? (
          <div className='employee-image'>
            <img alt='' src={props.profileImages[0]} aria-hidden='true' />
          </div>
        ) : null}
        {profileImages.length != 0 ? (
          <div className='employee-title'>
            <Title size='1'>{title}</Title>
          </div>
        ) : (
          <div>
            <Title size='1'>{title}</Title>
          </div>
        )}
      </div>
    )
  }

  const renderEmployeeDetails = () => {
    return (
      <div className='employee-details col-12'>
        <div className={'row w-100' + (profileImages.length == 0 ? ' border-if-no-images' : '')}>
          {position ? (
            <div className='details-block col-lg col-12'>
              <div className='position-feather-icon'>
                <Share2 size={24} aria-hidden='true' />
              </div>
              <div>
                <div>{positionPhrase}</div>
                <div className='position-text'>{position}</div>
              </div>
            </div>
          ) : null}
          {area ? (
            <div className='details-block col-lg col-12'>
              <div>{isResearcher ? <Eye size={24} aria-hidden='true' /> : <Home size={24} aria-hidden='true' />}</div>
              <div>
                <div>{isResearcher ? researchAreaPhrase : departmentPhrase}</div>
                <Link href={area.href} linkType='profiled'>
                  {area.title}
                </Link>
              </div>
            </div>
          ) : null}
          {email ? (
            <div className='details-block col-lg col-12'>
              <div>
                <Send size={24} aria-hidden='true' />
              </div>
              <div>
                <div>{emailPhrase}</div>
                <span className='position-text'>
                  <Link href={'mailto:' + email} linkType='profiled'>
                    {email}
                  </Link>
                </span>
              </div>
            </div>
          ) : null}
          {phone ? (
            <div className='details-block col-lg col-12'>
              <div>
                <Smartphone size={24} aria-hidden='true' />
              </div>
              <div>
                <div>{phonePhrase}</div>
                <Link href={'tel:' + phone} linkType='profiled'>
                  {sanitizeMobileNo(phone)}
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  const renderAttachmentsForDesktop = () => {
    return (
      <aside className='employee-attachments mobile-display-none col-12 col-md-3'>
        {profileImages.length != 0 ? (
          <React.Fragment>
            <div className='instructions'>
              <h2>{pressPicturesPhrase}</h2>
              <p>{pressPicturesDescrPhrase}</p>
            </div>
            {renderPortraitImages()}
          </React.Fragment>
        ) : null}
        {myCV ? renderDownloadCvButton() : null}
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
      <div className='row desktop-display-none'>
        <Accordion header={accordionHeader} className='employee-attachments'>
          <div className='instructions'>
            <p>{pressPicturesDescrPhrase}</p>
          </div>
          {renderPortraitImages()}
        </Accordion>
      </div>
    )
  }

  const renderEmployeeDescription = () => {
    return (
      <div className='row'>
        <div className='employee-description'>
          <div>
            <h2>{briefSummaryPhrase}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: sanitize(description),
              }}
            ></div>
          </div>
          {myCV ? <div className='desktop-display-none'>{renderDownloadCvButton()}</div> : null}
        </div>
      </div>
    )
  }

  const renderProjects = () => {
    const projectList = projects.map((project, i) => {
      return (
        <li key={i}>
          <Link href={project.href} linkType='header'>
            {project.title}
          </Link>
          <Paragraph>{project.description}</Paragraph>
        </li>
      )
    })
    return (
      <div className='row justify-content-center'>
        <div className='employee-projects'>
          <h2>{projectsPhrase}</h2>
          <ul>{projectList}</ul>
        </div>
      </div>
    )
  }

  const renderPublications = () => {
    return (
      <div className='row justify-content-center'>
        <div className='employee-publications'>
          <h2>{publicationsPhrase}</h2>
        </div>
      </div>
    )
  }

  return (
    <section className='xp-part employee container p-0 mb-5'>
      <div className='row'>{renderEmployeeHead()}</div>

      <div className='row row-gutter-desktop'>{renderEmployeeDetails()}</div>

      <div className='row row-gutter-desktop'>
        {renderAttachmentsForDesktop()}
        {profileImages.length != 0 ? renderAttachmentsForMobile() : null}

        <div className='col-12 col-md-6 row-gutter-mobile mt-4'>
          {description ? renderEmployeeDescription() : null}
          {projects.length != 0 ? renderProjects() : null}
          {cristinId ? renderPublications() : null}
        </div>
      </div>
    </section>
  )
}

export default (props: EmployeeProps) => <Employee {...props} />
