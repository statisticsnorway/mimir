import React from 'react'
// import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'


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
    title, email, position, phone, description, profileImages, myCV, projects, isResearcher, cristinId
  } = props

  const renderProjects = () => {
    const projects = mockData.projects.map(project => {
      return (
        <div>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
        </div>
      )
    })
    return <div>{projects}</div>
  }

  const renderPublications = () => {
    const publication = mockData.publications[0]
    return <div>
      <h3>{publication.title}</h3>
      <p>{publication.author}</p>
      <p>{publication.description}</p>
    </div>
  }

  return (
    <section className="xp-part employee container p-0 mb-5">
      <div className="row">
        <div class="employee-head">
          <div className="employee-image col-3"><img alt={`profilbilder av ${title}`} src={props.profileImages[0]} /></div>
          <div className="employee-title col-6"><h1>{title}</h1></div>
        </div>
      </div>
      <div className="row gx-0">
        <div className="employee-details">
          <div> Stilling: {position} </div>
          <div> E-post: {email} </div>
          <div> Telefon: {phone} </div>
          <div> {isResearcher ? "ForskningsOmråde:" : "Avdeling:"} </div>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="employee-description col-6">
          <div>
            <h2>Kort om</h2>
            <p>{description}</p>
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
  cristinId: PropTypes.string | null
}

export default (props) => <Employee {...props} />
