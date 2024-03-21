import React from 'react'
import { Link, Divider, Text } from '@statisticsnorway/ssb-component-library'
import { sanitize } from '../../../lib/ssb/utils/htmlUtils'
import {
  type Area,
  type EmployeeListProps,
  type IEmployeeMap,
  type IPreparedEmployee,
} from '../../../lib/types/partTypes/employeeList'

function EmployeeList(props: EmployeeListProps) {
  const { employees, total, pageTitle, pageDescription } = props

  const sanitizeMobileNo = (number: string) => {
    const spacesRemoved = number.split(' ').join('')
    const numberMatchesInTwo = spacesRemoved.match(/.{1,2}/g)
    return numberMatchesInTwo?.join(' ')
  }

  const renderLetterBlock = (index: number, alphabetLetter: string) => {
    return (
      <>
        {index == 0 ? (
          <div className='letter'>
            <h2>{alphabetLetter}</h2>
          </div>
        ) : (
          <div className='empty-letter'></div>
        )}
      </>
    )
  }

  const employeeDetails = (employee: IPreparedEmployee) => {
    return (
      <div>
        <Link href={employee.path} linkType='header'>
          {employee.surname}, {employee.name}
        </Link>
        {employee.position ? (
          <div className='position'>
            <Text small>{employee.position}</Text>
          </div>
        ) : null}
        <div className='contact-details'>
          <Text small>
            {(employee.area as Area).title != undefined ? (
              <>
                <Link href={(employee.area as Area).href}>{(employee.area as Area).title}</Link>
              </>
            ) : null}

            {(employee.area as Area).title == undefined
              ? null
              : ((employee.area as Area).title =
                  employee.email == '' && employee.phone == '' ? null : <span className='dash-space'> / </span>)}

            {employee.email != '' ? (
              <>
                <Link href={'mailto:' + employee.email}>{employee.email}</Link>
              </>
            ) : null}

            {employee.phone == '' || employee.email == '' ? null : <span className='dash-space'> / </span>}
            {employee.phone != '' ? (
              <>
                <Link href={'tel:' + employee.phone}>{sanitizeMobileNo(employee.phone)}</Link>
              </>
            ) : null}
          </Text>
        </div>
      </div>
    )
  }

  const createListItems = (list: IEmployeeMap) => {
    return list.record.map((employee, i) => {
      return (
        <>
          <li className='list-item' role='listitem'>
            {renderLetterBlock(i, list.alphabet)}
            <div className='employee-info'>{employeeDetails(employee)}</div>
          </li>
          <Divider light />
        </>
      )
    })
  }

  const renderEmployees = () => {
    const listItems = employees.map((employeesByLetter) => {
      return createListItems(employeesByLetter)
    })

    return (
      <div className='letter-list-container'>
        <Divider dark />
        <ul className='letter-list'>{listItems}</ul>
      </div>
    )
  }

  return (
    <section className='xp-part employees-list p-0 mb-5'>
      <div className='row banner'>
        <div className='container'>
          <h1 className='page-title'>{pageTitle}</h1>
          {pageDescription ? (
            <div
              className='page-description'
              dangerouslySetInnerHTML={{
                __html: sanitize(pageDescription),
              }}
            ></div>
          ) : null}
        </div>
      </div>
      <div className='row'>
        <div className='container'>
          <div className='person-count'>
            <p>Det er {total} personer i avdelingen</p>
          </div>
          {employees.length > 0 ? renderEmployees() : null}
        </div>
      </div>
    </section>
  )
}

export default (props: EmployeeListProps) => <EmployeeList {...props} />
