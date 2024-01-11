import React from 'react'
import { Row } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { Input, Divider } from '@statisticsnorway/ssb-component-library'

function handleChange() {}

function getTableData(table, code, query) {
  return null
}

function getResultfromTable() {
  return '75900'
}

function renderIcon(icon, altText) {
  if (!!icon) {
    return (
      <div>
        <img src={icon} alt={altText ? altText : ''} className='desktop-icons' />
      </div>
    )
  } else {
    return
  }
}

function SingleQuery(props) {
  const { icon, altText, ingress, placeholder, resultLayout, table, code, query } = props
  const tableData = getTableData(table, code, query) // query to backend
  const result = getResultfromTable()
  const resultView = resultLayout.replace('{value}', result)
  const textIngress = <span dangerouslySetInnerHTML={{ __html: ingress }} />
  const textResult = <span dangerouslySetInnerHTML={{ __html: resultView }} />

  return (
    <React.Fragment key={`single-query-tema`}>
      <Row>
        {renderIcon(icon, altText)}
        <div>
          <div>{textIngress}</div>
          <Input label={placeholder} handleChange={handleChange} value={tableData}></Input>
        </div>
      </Row>
      <Divider light />
      <Row>{textResult}</Row>
    </React.Fragment>
  )
}

SingleQuery.propTypes = {
  code: PropTypes.string,
  icon: PropTypes.string,
  altText: PropTypes.string,
  ingress: PropTypes.string,
  placeholder: PropTypes.string,
  table: PropTypes.string,
  code: PropTypes.string,
  query: PropTypes.string,
  resultLayout: PropTypes.string,
}

export default (props) => <SingleQuery {...props} />
