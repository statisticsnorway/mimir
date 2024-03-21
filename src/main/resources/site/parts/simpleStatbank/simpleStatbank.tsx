import React, { useState } from 'react'
import { Row, Col } from 'react-bootstrap'
import { Dropdown, Divider } from '@statisticsnorway/ssb-component-library'
import { type DimensionData, type SimpleStatbankProps } from '../../../lib/types/partTypes/simpleStatbank'

type DropdownItem = {
  id: string
  title: string
  value: DimensionData['value']
  time: string
}

function SimpleStatbank(props: SimpleStatbankProps) {
  const { icon, altText, ingress, placeholder, resultLayout, selectDisplay, statbankApiData } = props

  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />

  const [selectedValue, setSelectedValue] = useState<null | DropdownItem>(null)

  function handleChange(value: DropdownItem) {
    if (value) {
      setSelectedValue(value)
    }
  }

  function renderIcon(icon: string, altText: string) {
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
    if (selectedValue?.value) {
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
        {renderIcon(icon!, altText!)}
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

export default (props: SimpleStatbankProps) => <SimpleStatbank {...props} />
