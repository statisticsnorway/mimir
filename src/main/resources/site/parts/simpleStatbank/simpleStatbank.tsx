import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col } from 'react-bootstrap'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'

function SimpleStatbank(props) {
  const { icon, altText, ingress, placeholder, resultLayout, selectDisplay, statbankApiData } = props

  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [selectedValue, setSelectedValue] = useState(null)

  function handleChange(value) {
    if (value) {
      setSelectedValue(value)
    }
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
      const resultView = resultLayout.replace('{value}', result).replace('{time}', selectedValue.time)
      const textResult = <span dangerouslySetInnerHTML={{ __html: resultView }} />
      return (
        <div>
          <Divider light />
          <Row className='content'>{textResult}</Row>
        </div>
      )
    }
  }

  function addDropdown() {
    const items = statbankApiData
      ? statbankApiData.data.map((element) => ({
          id: element.dataCode,
          title: selectDisplay == 'text' ? element.displayName : `${element.dataCode}: ${element.displayName}`,
          value: element.value,
          time: element.time,
        }))
      : []
    return (
      <Dropdown
        header={textIngress}
        searchable
        items={items}
        onSelect={handleChange}
        placeholder={statbankApiData ? placeholder : 'Ingen data'}
      />
    )
  }

  function renderForm() {
    return (
      <Row className='content'>
        {renderIcon(icon, altText)}
        <Col>{addDropdown()}</Col>
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
  statbankApiData: PropTypes.objectOf({
    data: PropTypes.object,
  }),
}

export default (props) => <SimpleStatbank {...props} />
