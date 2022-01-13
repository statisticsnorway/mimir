import React from 'react'
import PropTypes from 'prop-types'
import { Link, Text, Title } from '@statisticsnorway/ssb-component-library'
import { Container } from 'react-bootstrap'

function ResearchEmployeeList(props) {
  function renderList() {
    return (
      <ol className="employeeList">
        {
          props.groupedEmployees.map((group, index) => {
            return (
              group.employees.map((employee, index) => renderEmployee(group.letter, employee, index))
            )
          })
        }
      </ol>
    )
  }

  function renderEmployee(letter, employee, index) {
    const employeeUrl = '/' + employee.id
    const key = letter + '-' + index
    return (
      <li className="research-employee" key={key}>
        {index === 0 &&
          <span className="letter">{letter}</span>
        }
        <div className="employee-info">
          <Link href={employeeUrl} linkType='header'>{employee.surName}, {employee.firstName}</Link>
          <p className="my-1">Stillingstittel</p>
          <Text small>Telefonnr/ Mailadresse / Forskningsområde</Text>
        </div>
      </li>
    )
  }


  return (
    <section className="research-employee-list container">
      <Title>{props.title}</Title>
      <Container>
        { renderList()}
      </Container>

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
