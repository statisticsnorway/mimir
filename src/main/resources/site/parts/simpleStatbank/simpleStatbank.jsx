import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Row, Col, Container, Form } from 'react-bootstrap'
import { Dropdown, Title } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'

function SimpleStatbank(props) {
  const { icon, altText, title, ingress, labelDropdown, resultText, resultFooter, timeLabel, statbankApiData, unit } =
    props

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

  function renderResult() {
    if (selectedValue) {
      const value = selectedValue.value ?? '-'
      const time = selectedValue.time
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
                {timeLabel} {time}
              </span>
            </Row>
            <Row>
              <div className='result'>
                <span className='value float-md-end'>
                  {value} {unit}
                </span>
              </div>
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
          title: element.displayName, // : `${element.dataCode}: ${element.displayName}`,
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
        placeholder={statbankApiData ? labelDropdown : 'Ingen data'}
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
  resultText: PropTypes.string,
  unit: PropTypes.string,
  timeLabel: PropTypes.string,
  resultFooter: PropTypes.string,
  code: PropTypes.string,
  urlOrId: PropTypes.string,
  statbankApiData: PropTypes.objectOf({
    data: PropTypes.object,
  }),
}

export default (props) => <SimpleStatbank {...props} />
