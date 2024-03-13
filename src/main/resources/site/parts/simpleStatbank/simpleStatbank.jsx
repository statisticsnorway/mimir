import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Container } from 'react-bootstrap'
import { Dropdown, Title } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'

function SimpleStatbank(props) {
  const {
    icon,
    altText,
    title,
    ingress,
    labelDropdown,
    resultText,
    resultFooter,
    timeLabel,
    statbankApiData,
    unit,
    placeholderDropdown,
    noNumberText,
  } = props

  const [selectedValue, setSelectedValue] = useState(null)

  function handleChange(value) {
    if (value) {
      setSelectedValue(value)
    }
  }

  function renderIcon(icon, altText) {
    if (!!icon) {
      return (
        <div className='icon-wrapper'>
          <img src={icon} alt={altText ? altText : ''} aria-hidden='true' />
        </div>
      )
    } else {
      return
    }
  }

  function renderNumber() {
    if (selectedValue.value) {
      return (
        <div className='number-section float-md-end'>
          <span className='number'>{selectedValue.value}</span>
          {unit && <span className='unit'>{unit}</span>}
        </div>
      )
    } else {
      return <span className='no-number'>{noNumberText}</span>
    }
  }

  function renderResult() {
    if (selectedValue) {
      return (
        <div>
          <Container className='simple-statbank-result'>
            <Row>
              <Title size={3} className='result-title'>
                {resultText}
              </Title>
            </Row>
            <Row>
              <span className='time'>
                {timeLabel} {selectedValue.time}
              </span>
            </Row>
            <Row>
              <div className='result'>{renderNumber()}</div>
            </Row>
            {resultFooter && (
              <Row>
                <div
                  dangerouslySetInnerHTML={{
                    __html: sanitize(resultFooter.replace(/&nbsp;/g, ' ')),
                  }}
                ></div>
              </Row>
            )}
          </Container>
        </div>
      )
    }
  }

  function addDropdown() {
    const items = statbankApiData
      ? statbankApiData.data.map((element) => ({
          id: element.dataCode,
          title: element.displayName,
          value: element.value,
          time: element.time,
        }))
      : []
    return (
      <Dropdown
        header={labelDropdown}
        searchable
        items={items}
        onSelect={handleChange}
        placeholder={placeholderDropdown ?? ''}
      />
    )
  }

  function renderForm() {
    return (
      <Container className='simple-statbank-input'>
        <Row>
          <Col className='col-12 col-md-8'>
            {props.title && <Title size={3}>{title}</Title>}
            {props.ingress && (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitize(ingress.replace(/&nbsp;/g, ' ')),
                }}
              ></div>
            )}
            {addDropdown()}
          </Col>
          <Col className='col-md-4'>{renderIcon(icon, altText)}</Col>
        </Row>
      </Container>
    )
  }

  return (
    <section className='simple-statbank container-fluid p-0'>
      {renderForm()}
      {renderResult()}
    </section>
  )
}

SimpleStatbank.propTypes = {
  icon: PropTypes.string,
  altText: PropTypes.string,
  title: PropTypes.string,
  ingress: PropTypes.string,
  labelDropdown: PropTypes.string,
  placeholderDropdown: PropTypes.string,
  resultText: PropTypes.string,
  unit: PropTypes.string,
  timeLabel: PropTypes.string,
  resultFooter: PropTypes.string,
  noNumberText: PropTypes.string,
  statbankApiData: PropTypes.objectOf({
    data: PropTypes.object,
  }),
}

export default (props) => <SimpleStatbank {...props} />
