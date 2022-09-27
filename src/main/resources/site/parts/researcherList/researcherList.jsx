import React from 'react'
import PropTypes from 'prop-types'

function ResearcherList(props) {
  const { title, researchers } = props

  const groupedCollection = {};

  const sortAlphabetically = (obj) => {
    return Object.keys(obj)
      .sort()
      .reduce((accumulator, key) => {
        accumulator[key] = obj[key];

    return accumulator;
  }, {});

  }

  for (let i = 0; i < researchers.length; i++) {       
    let firstLetter = researchers[i].surname.charAt(0);
    
    if (groupedCollection[firstLetter] == undefined) {             
      groupedCollection[firstLetter] = [];         
    }         
    groupedCollection[firstLetter].push(researchers[i]);     
  }

  const renderResearchers = () => {
    let html = []
    const sortedGroupCollection = sortAlphabetically(groupedCollection)
    for (const [letter, researchersList] of Object.entries(sortedGroupCollection)) {
      html.push(<h2>letter: {letter}</h2>)
      let box = researchersList.map((researcher, i) => {
        return (
          <>
            {/* {i === 0 ? <h2>letter: {letter}</h2> : null} */}
            <li className={`${i === 0 ? 'first' : ''}`} >
              <p>{researcher.surname}, {researcher.name}</p>
              {researcher.area ? <p>{researcher.area}</p> : null}
              <p>{researcher.phone} / {researcher.email} / Forskningsområde</p> 
            </li>
          </>
        )
      })

      html.push(box)
    }

    return (
      <ul>
        {html}
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
