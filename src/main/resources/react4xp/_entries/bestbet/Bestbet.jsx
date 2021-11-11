import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Form, Modal } from 'react-bootstrap'
import { Title, Link, Tag, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { XCircle } from 'react-feather'
import axios from 'axios'
function Bestbet(props) {
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const handleCloseModal = () => setShowModal(false)

  function handleSubmit() {
  }

  function handleKeywordOnClick() {
    setShowModal(true)
    return (
      <Modal
        show={showModal}
        onHide={handleCloseModal}
      >
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vil du slette {/* nøkkelord */} fra {/* navn på innhold */}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button primary negative>Slett</Button>
          <Button onClick={handleCloseModal}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function handleEditKeywordOnClick() {
    // TODO: Open popup with renderForm, include already existing keywords for that content
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
          {/* WIP */}
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

  // function fetchBestBetList() {
  //   setLoading(true)
  //   axios.get(props.bestBetListServiceUrl, {
  //     // params: {
  //     //   start: 0,
  //     //   count: 10,
  //     //   hits
  //     // }
  //   }).then((res) => {
  //     console.log(res.data)
  //   }).finally(() => {
  //     setLoading(false)
  //   })
  // }

  function renderBestbetList() {
    // TODO: List dynamically; done manually currently for testing purposes
    //  Add spinner on loading? Load a certain amount at a time?
    return (
      <Row className="justify-content-between">
        <Col className="col-8 bestbet-list">
          {props.bestBetList.body.hits.map((bet) => renderListItem(bet))}
        </Col>
        {renderForm()}
      </Row>
    )
  }

  function renderListItem( item ) {
    return (
      <Row>
        <Col className="col-6">
          <Title size={2}>Liste med innhold</Title>
          <ul>
            <li>
              <Link href="/">en link tekst {item.linkedContentId}</Link>
            </li>
            <li>
            </li>
          </ul>
        </Col>
        <Col>
          <Title size={2}>Nøkkelord</Title>
          <div className="d-flex flex-wrap">
            {item.searchWords.map((word) => renderKeyword(word))}
            <Button className="m-1" onClick={handleEditKeywordOnClick}>Rediger</Button>
          </div>
        </Col>
      </Row>
    )
  }

  function renderKeyword(word) {
    return ( <Tag className="m-1" onClick={handleKeywordOnClick}>{word} <XCircle size={16} /></Tag>)
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
  logoUrl: PropTypes.string,
  bestBetListServiceUrl: PropTypes.string,
  bestBetList: PropTypes.array
}

export default (props) => <Bestbet {...props} />

