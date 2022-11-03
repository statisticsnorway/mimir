import React from 'react'
import { Dropdown } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const DropdownMunicipality = (props) => {
  return (
    <Dropdown
      items={props.items}
      searchable
      placeholder={props.placeholder}
      ariaLabel={props.ariaLabel}
      onSelect={(e) => {
        onSelectMunicipality(e, props.baseUrl)
      }}
    />
  )
}

const onSelectMunicipality = (e, baseUrl) => {
  const url = baseUrl + e.id
  window.location.href = url
}

DropdownMunicipality.propTypes = {
  ariaLabel: PropTypes.string,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      id: PropTypes.string,
    })
  ),
  placeholder: PropTypes.string,
  baseUrl: PropTypes.string,
}

export default DropdownMunicipality
