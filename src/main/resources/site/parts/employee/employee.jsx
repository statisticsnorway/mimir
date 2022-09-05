import React from 'react'
// import { Title, Link, Divider } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

function Employee(props) {
  const {
    title, email, position, phone, description, profileImages, myCV, projects, isResearcher, cristinId
  } = props
  
  console.log(props)

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
          <p>..........</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="employee-publications col-6">
          <h2>Publiseringer</h2>
          <p>..........</p>
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
