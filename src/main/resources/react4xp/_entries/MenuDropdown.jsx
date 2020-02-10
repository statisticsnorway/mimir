import React from 'react'
import { Input } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'

const MenuDropdown = (props) => {
  return (
    <Input
      {...props}
      className="d-block"
      role="button"
      data-display="static"
      data-toggle="dropdown"
      aria-haspopup="true"
      aria-expanded="false"
    >
      <div
        id="municipality-list"
        className="dropdown-menu w-100 list-of-options"
        aria-labelledby={props.id}
      >
        {props.municipalities.map((municipality, index) => {
          return (
            <a
              key={`municipality-${index}`}
              className="dropdown-item a-plain option-list-element"
              href={props.baseUrl + municipality.path}
              data-text={municipality.displayName + ' ' + municipality.code}
            >
              {municipality.displayName}
            </a>
          )
        }
        )}
      </div>
    </Input>
  )
}

MenuDropdown.propTypes = {
  municipalities: PropTypes.arrayOf(
    PropTypes.shape({
      code: PropTypes.string,
      displayName: PropTypes.string,
      path: PropTypes.string
    })
  ).isRequired
}

export default MenuDropdown
