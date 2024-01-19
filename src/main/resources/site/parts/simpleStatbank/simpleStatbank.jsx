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
    table,
    selectDisplay,
  } = props

  // TODO: Hentet denne fra richText-part. Kan denne saniteres?
  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [selectedValue, setSelectedValue] = useState(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState([])
  const [time, setTime] = useState(null)

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

  function fetchTableData() {
    setLoading(true)
    axios
      .get(simpleStatbankServiceUrl, {
        params: {
          table,
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
      // Håndtere visning hvis resultatet er:
      // : = Vises ikke av konfidensialitetshensyn. Tall publiseres ikke for å unngå å identifisere personer eller virksomheter.
      // . = Ikke mulig å oppgi tall. Tall finnes ikke på dette tidspunktet fordi kategorien ikke var i bruk da tallene ble samlet inn.
      const resultView = resultLayout.replace('{value}', selectedValue.value).replace('{time}', time)
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
  table: PropTypes.string,
  selectDisplay: PropTypes.string,
}

export default (props) => <SimpleStatbank {...props} />
