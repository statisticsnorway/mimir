import React, { useState, useEffect, useRef } from 'react'
import { Row, Col, Container } from 'react-bootstrap'
import { Dropdown, Title, Button } from '@statisticsnorway/ssb-component-library'
import { X } from 'react-feather'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import { type DimensionData, type SimpleStatbankProps } from '../../../lib/types/partTypes/simpleStatbank'

type DropdownItem = {
  id: string
  title: string
  value: DimensionData['value']
  time: string
}

function SimpleStatbank(props: SimpleStatbankProps) {
  const {
    icon,
    altText,
    title,
    ingress,
    labelDropdown,
    displayDropdown,
    resultText,
    resultFooter,
    timeLabel,
    statbankApiData,
    unit,
    placeholderDropdown,
    noNumberText,
    closeText,
  } = props

  const [selectedValue, setSelectedValue] = useState<DropdownItem | null>(null)
  const [showResult, setShowResult] = useState<boolean | null>(null)
  const scrollAnchor = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (showResult && scrollAnchor.current !== null) {
      scrollAnchor.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest',
      })
      scrollAnchor.current.focus()
    }
  }, [showResult])

  function closeResult() {
    setShowResult(false)
  }

  function handleChange(value: DropdownItem) {
    if (value) {
      setSelectedValue(value)
      setShowResult(true)
    }
  }

  function renderIcon(icon: string, altText: string) {
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
    if (selectedValue?.value) {
      return (
        <div className='number-section'>
          <span className='number'>{selectedValue.value}</span>
          {unit && <span className='unit'>{unit}</span>}
        </div>
      )
    } else {
      return <span className='no-number'>{noNumberText}</span>
    }
  }

  function renderResult() {
    if (selectedValue && showResult) {
      return (
        <Container className='simple-statbank-result' ref={scrollAnchor} tabIndex='0'>
          <div aria-live='polite' aria-atomic='true'>
            <Row>
              <Title size={3} className='result-title'>
                {resultText}
              </Title>
            </Row>
            <Row>
              <span className='periode'>
                {timeLabel} {selectedValue.time}
              </span>
            </Row>
            <Row>
              <div className='result' aria-atomic='true'>
                {renderNumber()}
              </div>
            </Row>
          </div>
          {resultFooter && (
            <Row>
              <div
                className='result-footer'
                dangerouslySetInnerHTML={{
                  __html: sanitize(resultFooter.replace(/&nbsp;/g, ' ')),
                }}
              ></div>
            </Row>
          )}
          <Row>
            <Col className='md-6'>
              <Button className='close-button' icon={<X size={18} />} onClick={() => closeResult()}>
                {closeText}
              </Button>
            </Col>
          </Row>
        </Container>
      )
    }
  }

  function addDropdown() {
    const items = statbankApiData
      ? statbankApiData.data.map((element) => ({
          id: `code_${element.dataCode}`,
          title: displayDropdown == 'text' ? element.displayName : `${element.dataCode}: ${element.displayName}`,
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
            {props.title && <Title size={2}>{title}</Title>}
            {props.ingress && (
              <div
                dangerouslySetInnerHTML={{
                  __html: sanitize(ingress.replace(/&nbsp;/g, ' ')),
                }}
              ></div>
            )}
            {addDropdown()}
          </Col>
          <Col className='col-md-4'>{renderIcon(icon, altText!)}</Col>
        </Row>
      </Container>
    )
  }

  return (
    <div className='container-fluid p-0'>
      {renderForm()}
      {renderResult()}
    </div>
  )
}

export default (props: SimpleStatbankProps) => <SimpleStatbank {...props} />
