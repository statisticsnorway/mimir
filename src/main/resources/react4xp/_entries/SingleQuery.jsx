import React, { useState } from 'react'
import PropTypes from 'prop-types'
import axios from 'axios'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'

// TODO: Flytt så denne ligger i mappen sammen med ts-fila og xml-fila??
function SingleQuery(props) {
  const { icon, altText, ingress, placeholder, resultLayout, table, code, query, singleQueryServiceUrl } = props
  const dropdownElements = getTableCategories(table, code, query)

  // TODO: Hentet denne fra richText-part. Kan denne saniteres?
  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [result, setResult] = useState(null)

  function handleChange(value) {
    if (!!value) {
      const temp = getResultfromTable(value.id)
      setResult(temp)
    }
  }

  // TODO: Hente kategorier fra tabellen for å populere autocomplete
  function getTableCategories() {
    return [
      { id: 0, title: 'lærer' },
      { id: 1, title: 'ingeniør' },
      { id: 2, title: 'lege' },
    ]
  }

  function getResultfromTable(selected) {
    // TODO: Skrive om så denne kun henter ut resultatet basert på innkommen tabell
    const salery = ['55900', '45900', '75900']
    return salery[selected]

    // TODO: Fikse spørring til servicen
    // axios
    //   .get(singleQueryServiceUrl, {
    //     params: {},
    //   })
    //   .then((res) => {
    //     setResult(res.data)
    //     console.log(res.data)
    //   })
  }

  function renderIcon(icon, altText) {
    if (!!icon) {
      return (
        <div>
          <img src={icon} alt={altText ? altText : ''} className='desktop-icons' aria-hidden='true' />
        </div>
      )
    } else {
      return
    }
  }

  function renderResult(resultLayout) {
    if (result) {
      const resultView = resultLayout.replace('{value}', result)
      // TODO: Hentet denne fra richText-part. Kan denne saniteres?
      const textResult = <span dangerouslySetInnerHTML={{ __html: resultView }} />
      return (
        <div>
          <Divider light />
          {textResult}
        </div>
      )
    }
  }

  // TODO: Fikse styling (kopiere klasser og styling fra gammel app??)
  return (
    <div>
      <div>
        {renderIcon(icon, altText)}
        <Dropdown
          header={textIngress}
          searchable
          items={dropdownElements}
          onSelect={handleChange}
          placeholder={placeholder}
        />
      </div>
      {renderResult(resultLayout)}
    </div>
  )
}

SingleQuery.propTypes = {
  code: PropTypes.string,
  icon: PropTypes.string,
  altText: PropTypes.string,
  ingress: PropTypes.string,
  placeholder: PropTypes.string,
  table: PropTypes.string,
  code: PropTypes.string,
  query: PropTypes.string,
  resultLayout: PropTypes.string,
  singleQueryServiceUrl: PropTypes.string,
}

export default (props) => <SingleQuery {...props} />
