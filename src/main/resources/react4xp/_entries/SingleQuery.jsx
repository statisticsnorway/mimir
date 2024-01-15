import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'

// TODO: Flytt så denne ligger i mappen sammen med ts-fila og xml-fila??
function SingleQuery(props) {
  const { icon, altText, ingress, placeholder, resultLayout } = props
  const dropdownElements = getTableCategories()

  // TODO: Hentet denne fra richText-part. Kan denne saniteres?
  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [result, setResult] = useState(null)

  function handleChange(value) {
    if (value) {
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
  }

  function renderIcon(icon, altText) {
    if (!!icon) {
      return (
        <Col>
          <img className='icon' src={icon} alt={altText ? altText : ''} aria-hidden='true' />
        </Col>
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
          <Row className='content'>{textResult}</Row>
        </div>
      )
    }
  }

  return (
    <div className='single-query'>
      <Row className='content'>
        {renderIcon(icon, altText)}
        <Col>
          <div className='warning-text'>Akkurat nå vises kun statiske data</div>
          <Dropdown
            header={textIngress}
            searchable
            items={dropdownElements}
            onSelect={handleChange}
            placeholder={placeholder}
          />
        </Col>
      </Row>
      {renderResult(resultLayout)}
    </div>
  )
}

SingleQuery.propTypes = {
  icon: PropTypes.string,
  altText: PropTypes.string,
  ingress: PropTypes.string,
  placeholder: PropTypes.string,
  resultLayout: PropTypes.string,
}

export default (props) => <SingleQuery {...props} />
