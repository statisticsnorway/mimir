import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'

function SimpleStatbank(props) {
  const { icon, altText, ingress, placeholder, resultLayout, simpleStatbankServiceUrl, json, code, table } = props

  // TODO: Hentet denne fra richText-part. Kan denne saniteres?
  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [selectedValue, setSelectedValue] = useState(null)
  const [loading, setLoading] = useState(null)
  const [data, setData] = useState(null)

  useEffect(() => {
    if (simpleStatbankServiceUrl && json && code && table) {
      fetchTableData()
    }
  }, [simpleStatbankServiceUrl, json, code, table])

  function handleChange(value) {
    if (value) {
      setSelectedValue(value)
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
          // Her må vi få inn id (index), time, value, label, og index i resultarray
          const items = res.data.map((element) => ({ id: element.index, title: element.label, value: element.value }))
          console.log(items)
          setData(items)
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
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

  function renderResult() {
    if (selectedValue) {
      const resultView = resultLayout.replace('{value}', selectedValue.value)
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

  function renderForm() {
    if (!loading && data) {
      return (
        <Row className='content'>
          {renderIcon(icon, altText)}
          <Col>
            <div className='warning-text'>Akkurat nå vises kun statiske data</div>
            <Dropdown header={textIngress} searchable items={data} onSelect={handleChange} placeholder={placeholder} />
          </Col>
        </Row>
      )
    }
  }

  function renderLoading() {
    if (loading) {
      return <div>loading</div>
    }
  }

  return (
    <div className='simple-statbank'>
      {renderLoading()}
      {renderForm()}
      {renderResult()}
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
