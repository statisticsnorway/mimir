import React from 'react'
import PropTypes from 'prop-types'

function ResearcherList(props) {
  const { title, researchers } = props

  console.log(researchers)

  const groupedCollection = {};

  for (let i = 0; i < researchers.length; i++) {       
    let firstLetter = researchers[i].surname.charAt(0);
    if (groupedCollection[firstLetter] == undefined) {             
      groupedCollection[firstLetter] = [];         
    }         
    groupedCollection[firstLetter].push(researchers[i]);     
  }

  console.log(groupedCollection)

  const renderResearchers = () => {
    let html = []
    for (const [letter, researchersList] of Object.entries(groupedCollection)) {
      
      let box = researchersList.map((researcher, i) => {
        return (
          <li className={`${i === 0 ? 'first' : ''}`} >
            <p>letter: {letter}</p>
            <p>{researcher.surname}, {researcher.name}</p> 
          </li>
        )
      }).flat()
      console.log("divBox", box)
      html.push(box)
    }
    console.log("html", html.flat().join(' '))
    return (
      <ul>
        {html.join(' ')}
      </ul>
    ) 
  }

  return (
    <section className="xp-part employee container p-0 mb-5">
      {title}
      {researchers != [] ? renderResearchers() : null}
    </section>
  )
}

export default (props) => <ResearcherList {...props} />

ResearcherList.propTypes = {
  title: PropTypes.string,
  researchers: PropTypes.array
}
