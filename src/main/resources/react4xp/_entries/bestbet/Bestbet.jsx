import React from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Form } from 'react-bootstrap'
import { Title, Link, Tag, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { XCircle } from 'react-feather'

function Bestbet(props) {
  function handleSubmit() {
    return
  }

  function handleKeywordOnClick() {
    // TODO: Popup for delete confirmation
    return
  }

  function handleEditKeywordOnClick() {
    // TODO: Open popup with renderForm, include already existing keywords for that content
    return
  }

  function renderForm() {
    return (
      <Col className="bestbet-list ml-4">
        <Title size={2}>Legg til nøkkelord</Title>
        <Form onSubmit={handleSubmit}>
          <Dropdown
            header="Søk og velg innhold"
            placeholder="Søk og velg innhold"
            searchable />
          {/* TODO: Use react tag input */}
          <Input
            className="mt-3"
            label="Skriv inn nøkkelord"
            placeholder="Skriv inn nøkkelord"
          />
          <Button className="mt-3">Legg til</Button>
        </Form>
      </Col>
    )
  }

  function renderBestbetList() {
    // TODO: List dynamically; done manually currently for testing purposes
    //  Add spinner on loading? Load a certain amount at a time?
    return (
      <Row className="justify-content-between">
        <Col className="col-8 bestbet-list">
          <Row>
            <Col className="col-6">
              <Title size={2}>Liste med innhold</Title>
              <ul>
                <li>
                  <Link href="/">Lorem ipsum dolor sit amet, consectetur adipiscing elit. {props.value}</Link>
                </li>
              </ul>
            </Col>
            <Col>
              <Title size={2}>Nøkkelord</Title>
              <div className="d-flex flex-wrap">
                <Tag className="m-1" onClick={handleKeywordOnClick}>Lorem <XCircle size={16} /></Tag>
                <Tag className="m-1" onClick={handleKeywordOnClick}>ipsum <XCircle size={16} /></Tag>
                <Tag className="m-1" onClick={handleKeywordOnClick}>dolor <XCircle size={16} /></Tag>
                <Tag className="m-1" onClick={handleKeywordOnClick}>sit <XCircle size={16} /></Tag>
                <Tag className="m-1" onClick={handleKeywordOnClick}>amet <XCircle size={16} /></Tag>
                <Button className="m-1" onClick={handleEditKeywordOnClick}>Rediger</Button>
              </div>
            </Col>
          </Row>
        </Col>
        {renderForm()}
      </Row>
    )
  }

  return (
    <Container fluid>
      <Row className="bestbet-header">
        <Col className="flex-row align-items-center">
          <img src={props.logoUrl} className="logo" />
          <Title size={1}>Best-bet søk</Title>
        </Col>
      </Row>
      {renderBestbetList()}
    </Container>
  )
}

Bestbet.propTypes = {
  value: PropTypes.string,
  logoUrl: PropTypes.string
}

export default (props) => <Bestbet {...props} />

