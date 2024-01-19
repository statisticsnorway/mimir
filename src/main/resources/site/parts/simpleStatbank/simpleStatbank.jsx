import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'

function SimpleStatbank(props) {
  const {
    icon,
    altText,
    ingress,
    placeholder,
    resultLayout,
    simpleStatbankServiceUrl,
    json,
    code,
    urlOrId,
    selectDisplay,
  } = props

  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [selectedValue, setSelectedValue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [time, setTime] = useState(null)

  useEffect(() => {
    if (simpleStatbankServiceUrl && json && code && urlOrId) {
      fetchTableData()
    }
  }, [simpleStatbankServiceUrl, json, code, urlOrId])

  function handleChange(value) {
    if (value) {
      setSelectedValue(value)
    }
  }

  function fetchTableData() {
    setLoading(true)
    axios
      .get(simpleStatbankServiceUrl, {
        params: {
          urlOrId,
          code,
          json,
        },
      })
      .then((res) => {
        if (res?.data?.data) {
          const items = res.data.data.map((element) => ({
            id: element.dataCode,
            title: selectDisplay == 'text' ? element.displayName : `${element.dataCode}: ${element.displayName}`,
            value: element.value,
          }))
          setTime(res.data.tid)
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
      const result = Number(selectedValue.value) > 0 ? selectedValue.value : '-'
      const resultView = resultLayout.replace('{value}', result).replace('{time}', time)
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
    return (
      <Row className='content'>
        {renderIcon(icon, altText)}
        <Col>
          <Dropdown
            header={textIngress}
            searchable
            items={data}
            onSelect={handleChange}
            placeholder={loading ? 'loading...' : placeholder}
          />
        </Col>
      </Row>
    )
  }

  return (
    <div className='simple-statbank'>
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
  urlOrId: PropTypes.string,
  selectDisplay: PropTypes.string,
}

export default (props) => <SimpleStatbank {...props} />
