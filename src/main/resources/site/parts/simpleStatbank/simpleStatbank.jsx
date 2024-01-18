import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'

function SimpleStatbank(props) {
  const { icon, altText, ingress, placeholder, resultLayout, simpleStatbankServiceUrl, json, code, table } = props

  // TODO: Hentet denne fra richText-part. Kan denne saniteres?
  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(null)
  const [data, setData] = useState(null)
  const [options, setOptions] = useState([
    { id: 0, title: 'lærer' },
    { id: 1, title: 'ingeniør' },
    { id: 2, title: 'lege' },
  ])

  fetchTableData()

  function handleChange(value) {
    if (value) {
      const temp = getResultfromTable(value.id)
      setResult(temp)
    }
  }

  // TODO: Hente kategorier fra tabellen for å populere autocomplete
  function fetchTableData() {
    setLoading(true)
    axios
      .get(simpleStatbankServiceUrl, {
        params: {
          table,
          code,
        },
        body: json,
      })
      .then((res) => {
        if (res) {
          console.log(res)
        }
      })
      .finally(() => {
        setLoading(false)
      })
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
    <div className='simple-statbank'>
      <Row className='content'>
        {renderIcon(icon, altText)}
        <Col>
          <div className='warning-text'>Akkurat nå vises kun statiske data</div>
          <Dropdown header={textIngress} searchable items={options} onSelect={handleChange} placeholder={placeholder} />
        </Col>
      </Row>
      {renderResult(resultLayout)}
    </div>
  )
}

SimpleStatbank.propTypes = {
  icon: PropTypes.string,
  altText: PropTypes.string,
  ingress: PropTypes.string,
  placeholder: PropTypes.string,
  resultLayout: PropTypes.string,
  simpleStatbankServiceUrl: PropTypes.string,
  json: PropTypes.string,
  code: PropTypes.string,
  table: PropTypes.string,
}

export default (props) => <SimpleStatbank {...props} />
