import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Modal } from 'react-bootstrap'
import { Title, Link, Tag, Dropdown, Input, Button } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit } from 'react-feather'
import { post } from 'axios'
import EditSearchWordsModal from './EditSearchWordsModal'

function Bestbet(props) {
  const [bestBetList, setBestBetList] = useState(props.bestBetList) // need?
  const [bestbetItem, setBestBetItem] = useState([])

  const [showDeleteSearchWordModal, setShowDeleteSearchWordModal] = useState(false)
  const handleCloseDeleteSearchWordModal = () => setShowDeleteSearchWordModal(false)

  const [showEditSearchWordsModal, setShowEditSearchWordsModal] = useState(false)
  const handleCloseEditSearchWordModal = () => setShowEditSearchWordsModal(false)

  const [inputTag, setInputTag] = useState('')
  const [searchWordsList, setSearchWordsList] = useState([])
  const [selectedSearchWord, setSelectedSearchWord] = useState('')
  const [displaySearchWordsForm, setDisplaySearchWordsForm] = useState(false)

  function handleSubmit() {
    if (showEditSearchWordsModal) setShowEditSearchWordsModal(false)
    const updatedBestBetItem = bestbetItem.length ? bestbetItem.map((item) => {
      return {
        ...item,
        searchWords: searchWordsList
      }
    }) : []

    if (updatedBestBetItem.length) {
      post(props.bestBetListServiceUrl, ...updatedBestBetItem)
        .then((res) => {
          console.log(res) // WIP
        })
        .catch((err) => {
          console.log(err)
        })
        .finally(() => {
          console.log('Sent') // WIP
        })
    }
  }

  function handleSearchWordOnClick(searchWord) {
    setSelectedSearchWord(searchWord)
    setShowDeleteSearchWordModal(true)
  }

  function handleDeleteSearchWord(selectedSearchWord) {
    setShowDeleteSearchWordModal(false)
    const updateDisplaySearchWordForm = searchWordsList.filter((searchWord) => searchWord !== selectedSearchWord)
    setSearchWordsList(updateDisplaySearchWordForm)
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
          <p>Vil du fjerne {selectedSearchWord} fra innholdet {/* navn på innhold */}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button primary onClick={() => handleDeleteSearchWord(selectedSearchWord)}>Fjern</Button>
          <Button onClick={handleCloseDeleteSearchWordModal}>Lukk</Button>
        </Modal.Footer>
      </Modal>
    )
  }

  function renderEditSearchWordModal() {
    return (
      <EditSearchWordsModal
        show={showEditSearchWordsModal}
        onHide={handleCloseEditSearchWordModal}
        body={
          <>
            {searchWordsList.length ?
              <Row>
                <Col className="d-flex flex-wrap mt-3">
                  {searchWordsList.map((searchWord) => renderSearchWord(searchWord, true))}
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
          </>
        }
        footer={
          <>
            <Button primary onClick={handleSubmit}>Rediger</Button>
            <Button onClick={handleCloseEditSearchWordModal}>Lukk</Button>
          </>
        }
      />
    )
  }

  function handleEditSearchWordOnClick(item) {
    setShowEditSearchWordsModal(true)
    setBestBetItem([item])
    setSearchWordsList(item.searchWords)
  }

  function handleDropdownOnSelect(item) {
    const getBestBetItem = bestBetList.body.hits.filter(({
      id
    }) => id === item.id)

    if (getBestBetItem.length) {
      setBestBetItem(getBestBetItem)
      setSearchWordsList(getBestBetItem[0].searchWords)
      setDisplaySearchWordsForm(true)
    }
  }

  function handleTagInput(event) {
    setInputTag(event)
  }

  function handleTagSubmit() {
    setSearchWordsList([...searchWordsList, inputTag])
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
        {displaySearchWordsForm && searchWordsList.length ?
          <Row>
            <Col className="d-flex flex-wrap mt-3">
              {searchWordsList.map((searchWord) => renderSearchWord(searchWord))}
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
    const sortedBestBetList = bestBetList.body.hits.sort((a, b) => a.linkedContentId - b.linkedContentId)
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
          {sortedBestBetList.map((bet) => renderListItem(bet))}
        </Col>
        {renderForm()}
      </Row>
    )
  }

  function renderSearchWord(searchWord, isInEditModal, disabled) {
    if (!disabled) {
      const searchWordOnClickCallback = isInEditModal ? () => handleDeleteSearchWord(searchWord) : () => handleSearchWordOnClick(searchWord)
      return (
        <Tag className="m-1" onClick={searchWordOnClickCallback}>
          {searchWord}<XCircle size={16} className="ml-1" />
        </Tag>
      )
    }

    return (
      <div className="search-words m-1">
        {searchWord}
      </div>
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
            {item.searchWords.map((searchWord) => renderSearchWord(searchWord, false, true))}
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
      {renderEditSearchWordModal()}
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

