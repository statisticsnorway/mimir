import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Link, Text, Title } from '@statisticsnorway/ssb-component-library'
import { Container } from 'react-bootstrap'
import { ChevronDown } from 'react-feather'

function ResearchEmployeeList(props) {
  const [employees, setEmployees] = useState(props.employees.slice(0, props.count))
  const letterList = []


  function renderList() {
    return (
      <ol className="employeeList">
        {
          employees.map((employee, index) => renderEmployee(employee, index))
        }
      </ol>
    )
  }

  function renderEmployee(employee, index) {
    const employeeUrl = '/' + employee.id
    const firstLetter = employee.surName.charAt(0)
    let showLetter = false
    if (letterList.indexOf(firstLetter) === -1) {
      showLetter = true
      letterList.push(firstLetter)
    }
    return (
      <li className="research-employee" key={index}>
        {showLetter &&
          <span className="letter">{firstLetter}</span>
        }
        <div className="employee-info">
          <Link href={employeeUrl} linkType='header'>{employee.surName}, {employee.firstName}</Link>
          <p className="my-1">Stillingstittel</p>
          <Text small>Telefonnr/ Mailadresse / Forskningsområde</Text>
        </div>
      </li>
    )
  }

  function fetchEmployees() {
    const countEmployees = employees.length
    const newEmployees = props.employees.slice(countEmployees, countEmployees + props.count)
    setEmployees(employees.concat(newEmployees))
  }


  return (
    <section className="research-employee-list container">
      <Title>{props.title}</Title>
      <Container>
        { renderList()}
      </Container>
      <div>
        <Button
          className="button-more mt-5"
          onClick={fetchEmployees}
        >
          <ChevronDown size="18"/> {props.buttonTitle}
        </Button>
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
  buttonTitle: PropTypes.string,
  count: PropTypes.number
}

export default (props) => <ResearchEmployeeList {...props} />
