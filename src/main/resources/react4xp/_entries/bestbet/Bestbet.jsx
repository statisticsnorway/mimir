import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Modal } from 'react-bootstrap'
import { Title, Link, Tag, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit } from 'react-feather'

function Bestbet(props) {
  const [showDeleteSearchWordModal, setShowDeleteSearchWordModal] = useState(false)
  const handleCloseDeleteSearchWordModal = () => setShowDeleteSearchWordModal(false)

  const [showEditSearchWordsModal, setShowEditSearchWordsModal] = useState(false)
  const handleCloseEditSearchWordModal = () => setShowEditSearchWordsModal(false)

  const [inputTag, setInputTag] = useState('')
  const [displaySearchWordsForm, setDisplaySearchWordsForm] = useState([])

  const [bestBetList, setBestBetList] = useState(props.bestBetList)

  function handleSubmit(event) {
    console.log('GLNRBN submit: ')
    event.preventDefault()
    // setBestBetList()
  }

  function handleSearchWordOnClick() {
    setShowDeleteSearchWordModal(true)
  }

  const DeleteSearchWordModal = () => {
    return (
      <Modal
        show={showDeleteSearchWordModal}
        onHide={handleCloseDeleteSearchWordModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Fjern nøkkelord</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Vil du fjerne {/* nøkkelord */} fra innholdet {/* navn på innhold */}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button primary>Fjern</Button>
          <Button onClick={handleCloseDeleteSearchWordModal}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function handleEditSearchWordOnClick(item) {
    setShowEditSearchWordsModal(true)
    setDisplaySearchWordsForm(item.searchWords)
  }

  const EditSearchWordsModal = () => {
    return (
      <Modal
        show={showEditSearchWordsModal}
        onHide={handleCloseEditSearchWordModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Rediger nøkkelord</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {displaySearchWordsForm.length ?
            <Row>
              <Col className="d-flex flex-wrap mt-3">
                {displaySearchWordsForm.map((searchWord) => renderSearchWord(searchWord))}
              </Col>
            </Row> : null}
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
        </Modal.Body>
        <Modal.Footer>
          <Button primary>Rediger</Button>
          <Button onClick={handleCloseEditSearchWordModal}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function handleDropdownOnSelect(item) {
    const getBestBetItem = bestBetList.body.hits.filter(({
      id
    }) => id === item.id)

    if (getBestBetItem.length) {
      setDisplaySearchWordsForm(getBestBetItem[0].searchWords)
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
        {displaySearchWordsForm.length ?
          <Row>
            <Col className="d-flex flex-wrap mt-3">
              {displaySearchWordsForm.map((searchWord) => renderSearchWord(searchWord))}
            </Col>
          </Row> : null}
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
            <Tag className="m-1" onClick={() => handleEditSearchWordOnClick(item)}>
              Rediger <Edit size={16} className="ml-1" />
            </Tag>
          </div>
        </Col>
      </Row>
    )
  }

  return (
    <Container fluid>
      <DeleteSearchWordModal />
      <EditSearchWordsModal />
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

