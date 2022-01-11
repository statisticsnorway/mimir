import React from 'react'
import PropTypes from 'prop-types'
import { Title } from '@statisticsnorway/ssb-component-library'

function ResearchEmployeeList(props) {
  function renderList() {
    return (
      <div>
        { props.groupedEmployees.map((group, index) => {
          return (
            <article className={index === 0 && 'first'} key={index}>
              <div className="letter">
                <span>{group.letter}</span>
              </div>
              <ol className="list-unstyled">
                {
                  group.employees.map((employee, index) => renderEmployee(employee, index))
                }
              </ol>
            </article>
          )
        }) }
      </div>
    )
  }

  function renderEmployee(employee, index) {
    return (
      <li key={index} className="mb-4">
        <span>{employee.surName}, {employee.firstName}</span>
      </li>
    )
  }


  return (
    <section className="research-employee-list container-fluid">
      <div className="container py-5">
        <Title>{props.title}</Title>
        { renderList()}
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
