import React from 'react'
import PropTypes from 'prop-types'
import { Title } from '@statisticsnorway/ssb-component-library'

function ResearchEmployeeList(props) {
  console.log('Grupperte ansatte: ' + JSON.stringify(props.groupedEmployees, null, 4))

  return (
    <section className="research-employee-list container-fluid">
      <div className="container py-5">
        <Title>{props.title}</Title>
      </div>
    </section>
  )
}


ResearchEmployeeList.propTypes = {
  title: PropTypes.string,
  employees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      surName: PropTypes.string
    })
  ),
  groupedEmployees: PropTypes.arrayOf(PropTypes.shape({
    letter: PropTypes.string,
    employees: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        firstName: PropTypes.string,
        surName: PropTypes.string
      }))
  }))
}

export default (props) => <ResearchEmployeeList {...props} />
