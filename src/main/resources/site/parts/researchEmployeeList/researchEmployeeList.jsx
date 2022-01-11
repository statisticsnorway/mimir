import React from 'react'
import PropTypes from 'prop-types'
import { Link, Text, Title } from '@statisticsnorway/ssb-component-library'

function ResearchEmployeeList(props) {
  function renderList() {
    return props.groupedEmployees.map((group, index) => {
      return (
        <article className={index === 0 && 'first'} key={index}>
          <ol className="employeeList">
            {
              group.employees.map((employee, index) => renderEmployee(group.letter, employee, index))
            }
          </ol>
        </article>
      )
    })
  }

  function renderEmployee(letter, employee, index) {
    return (
      <li className="research-employee" key={index}>
        {index === 0 &&
          <span className="letter">{letter}</span>
        }
        <div className="employee-info">
          <Link href={employee.url} linkType='header'>{employee.surName}, {employee.firstName}</Link>
          <p className="my-1">Forsker</p>
          <Text small>Telefonnr/ Mailadresse / Forskningsområde</Text>
        </div>
      </li>
    )
  }


  return (
    <section className="research-employee-list container">
      <Title>{props.title}</Title>
      { renderList()}
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
        surName: PropTypes.string,
        url: PropTypes.string
      }))
  }))
}

export default (props) => <ResearchEmployeeList {...props} />
