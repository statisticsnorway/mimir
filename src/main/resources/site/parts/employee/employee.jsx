import React from 'react'
import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Share2, Send, Smartphone, Eye, Download, ExternalLink } from 'react-feather'
import { Button } from '@statisticsnorway/ssb-component-library'

// mock data 
const mockData = {
  projects: [
    {
      title: "Konjunkturtendensene",
      description: "I konjunkturrapportene beskrives og analyseres den siste utviklingen i norske og internasjonal økonomi og utsiktene framover (normalt 3-4 år framover). Det publiseres fire konjunkturrapporter hvert år. Prognosene utarbeides med hjelp av SSBs makroøkonometriske modell KVARTS."
    },
    {
      title: "MODAG og KVARTS",
      description: "MODAG og KVARTS er makroøkonometriske modeller for norsk økonomi og benyttes til framskrivninger og politikkanalyser på kort og mellomlang sikt. Den viktigste forskjellen mellom de to modellene er at MODAG regner på årlige data, mens KVARTS regner på kvartalsvise data."
    },
    {
      title: "Etterspørselen etter ny teknologi",
      description: "I dette prosjektet studeres årsakene til den teknologiske utviklingen, og teknologiens virkning på økonomisk vekst og sysselsetting. Investeringer i forskning og utvikling (FoU) søkes implementert i et fullstendig system for etterspørsel etter innsatsfaktorer." 
    },
  ],
  publications: [
    {
      title: "Efficient combinations of taxes on fuel and vehicles",
      author: "Kyle Danny",
      description: "The Energy Journal / 2021"
    },
  ]
}

const Employee = (props) => {
  const {
    title, email, position, phone, description, profileImages, myCV, projects, isResearcher, cristinId, emailPhrase,
    phonePhrase,
    positionPhrase,
    researchAreaPhrase,
    departmentPhrase,
    briefSummaryPhrase
  } = props

  const renderProjects = () => {
    const projectList = projects.map(project => {
      return (
        <div>
          <Link href={project.href} linkType="header">{project.title}</Link>
          <p>{project.description}</p>
        </div>
      )
    })
    return <div>{projectList}</div>
  }

  const renderPublications = () => {
    const publication = mockData.publications[0]
    return <div>
      <Link href=" " icon={<ExternalLink size="20" />}>{publication.title}</Link>
      <p>{publication.author}</p>
      <p>{publication.description}</p>
    </div>
  }

  return (
    <section className="xp-part employee container p-0 mb-5">
      <div className="row">
        <div class="employee-head">
          <div className="employee-image col-3"><img alt={`profilbilder av ${title}`} src={props.profileImages[0]} /></div>
          <div className="employee-title col-6"><Title size="1">{title}</Title></div>
        </div>
      </div>
      <div className="row gx-0">
        <div className="employee-details">
          <div>
            <Share2 className="position-icon" size={30} transform='rotate(90)'/> 
            <div>
              <div>{positionPhrase}</div>
              <span>{position}</span>
            </div>
          </div>
          <div>
            <Send className="email-icon" size={30} />
            <div>
              <div>{emailPhrase}</div>
              <Link href={"mailto:" + email} linkType="profiled">{email}</Link>
            </div>
          </div>
          <div>
            <Smartphone className="phone-icon" size={30} />
            <div>
              <div>{phonePhrase}</div>
              <Link href=" " linkType="profiled">{phone}</Link>
            </div>
          </div>
          <div> 
            <Eye className="department-icon" size={30} />
            <div>
              <div>{isResearcher ? researchAreaPhrase : departmentPhrase}</div>
              <Link href=" " linkType="profiled">tester</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="employee-description col-6">
          <div>
            <h2>{briefSummaryPhrase}</h2>
            <p>{description}</p>
            <div>
              <Button><Download size="18" /> &nbsp; Last ned 3 portrettbilder (3,3 MB) </Button>
              <Button><Download size="18" /> &nbsp; Last ned CV (70 KB) </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="employee-projects col-6">
          <h2>Prosjekter</h2>
          { renderProjects() }
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="employee-publications col-6">
          <h2>Publiseringer</h2>
          { renderPublications() }
          { renderPublications() }
          { renderPublications() }
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
  isResearcher: PropTypes.bool,
  cristinId: PropTypes.string | null,
  emailPhrase: PropTypes.string,
  phonePhrase: PropTypes.string,
  positionPhrase: PropTypes.string,
  researchAreaPhrase: PropTypes.string,
  departmentPhrase: PropTypes.string,
  briefSummaryPhrase: PropTypes.string
}

export default (props) => <Employee {...props} />
