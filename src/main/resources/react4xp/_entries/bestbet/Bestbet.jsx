import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Form, Modal } from 'react-bootstrap'
import { Title, Link, Tag, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit } from 'react-feather'

function Bestbet(props) {
  const [showDeleteSearchWordModal, setDeleteSearchWordModal] = useState(false)
  const handleCloseDeleteSearchWordModal = () => setDeleteSearchWordModal(false)

  const [showEditSearchWordsModal, setEditSearchWordsModal] = useState(false)
  const handleCloseEditSearchWordModal = () => setEditSearchWordsModal(false)

  const [inputTag, setInputTag] = useState('')
  const [displaySearchWordsForm, setDisplaySearchWordsForm] = useState(['ett', 'nytt', 'ord'])

  const [bestBetList, setBestBetList] = useState(props.bestBetList)

  function handleSubmit(event) {
    console.log('GLNRBN submit: ')
    event.preventDefault()
    // setBestBetList()
  }

  function handleSearchWordOnClick() {
    setDeleteSearchWordModal(true)
    return (
      <Modal
        show={showDeleteSearchWordModal}
        onHide={handleCloseDeleteSearchWordModal}
      >
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vil du slette {/* nøkkelord */} fra {/* navn på innhold */}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button primary negative>Slett</Button>
          <Button onClick={handleCloseDeleteSearchWordModal}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function handleEditSearchWordOnClick() {
    setEditSearchWordsModal(true)
    return (
      <Modal
        show={showEditSearchWordsModal}
        onHide={handleCloseEditSearchWordModal}
      >
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm()}
        </Modal.Body>
        <Modal.Footer>
          <Button primary negative>Slett</Button>
          <Button onClick={handleCloseDeleteSearchWordModal}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function handleDropdownOnSelect(item) {
    const getBestBetItem = bestBetList.filter((id) => item.id === id)

    if (getBestBetItem.length) {
      setDisplaySearchWordsForm(getBestBetItem.map(({
        searchWords
      }) => renderSearchWord(searchWords)))
    }
  }

  function handleTagInput(event) {
    setInputTag(event)
  }

  function handleTagSubmit() {
    setDisplaySearchWordsForm([...displaySearchWordsForm, inputTag])
    setInputTag('')
  }

  function renderForm() {
    const items = []
    if (bestBetList.body.hits.length) {
      bestBetList.body.hits.map((bet) => {
        items.push({
          id: bet.id,
          title: bet.linkedContentId
        })
      })
    }
    console.log(JSON.stringify(items, null, 2))

    return (
      <Col className="bestbet-list ml-4">
        <Title size={2}>Legg til nøkkelord</Title>
        <Dropdown
          header="Søk og velg innhold"
          placeholder="Søk og velg innhold"
          items={items}
          onSelect={handleDropdownOnSelect}
          searchable
        />
        {displaySearchWordsForm.length ? displaySearchWordsForm.map((searchWord) => renderSearchWord(searchWord)) : null}
        <Row>
          <Col>
            <Input
              handleChange={handleTagInput}
              value={inputTag}
              className="mt-3"
            />
          </Col>
          <Col>
            <Button primary onClick={handleTagSubmit} className="mt-3">Legg til</Button>
          </Col>
        </Row>
        <Row>
          <Col className="col-12 justify-content-center">
            <Button primary onClick={handleSubmit} className="mt-3 mx-0">Fullfør</Button>
          </Col>
        </Row>
      </Col>
    )
  }

  function renderBestbetList() {
    return (
      <Row className="justify-content-between">
        <Col className="col-8 bestbet-list">
          <Row>
            <Col className="col-6">
              <Title size={2}>Liste med innhold</Title>
            </Col>
            <Col>
              <Title size={2}>Nøkkelord</Title>
            </Col>
          </Row>
          {bestBetList.body.hits.map((bet) => renderListItem(bet))}
        </Col>
        {renderForm()}
      </Row>
    )
  }

  function renderSearchWord(searchWord) {
    return (
      <Tag className="m-1" onClick={() => handleSearchWordOnClick()}>
        {searchWord}<XCircle size={16} className="ml-1" />
      </Tag>
    )
  }

  function renderListItem(item) {
    return (
      <Row>
        <Col className="col-6">
          <li><Link href="/">en link tekst {item.linkedContentId}</Link></li>
        </Col>
        <Col>
          <div className="d-flex flex-wrap">
            {item.searchWords.map((searchWord) => renderSearchWord(searchWord))}
            <Tag className="m-1" onClick={() => handleEditSearchWordOnClick}>
              Rediger <Edit size={16} className="ml-1" />
            </Tag>
          </div>
        </Col>
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
  logoUrl: PropTypes.string,
  bestBetListServiceUrl: PropTypes.string,
  bestBetList: PropTypes.array
}

export default (props) => <Bestbet {...props} />

