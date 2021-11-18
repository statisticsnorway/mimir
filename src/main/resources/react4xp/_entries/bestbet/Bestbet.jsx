import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col, Modal } from 'react-bootstrap'
import { Title, Link, Tag, Input, Button, Divider } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit } from 'react-feather'
import { get, post } from 'axios'
import EditSearchWordsModal from './EditSearchWordsModal'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import 'regenerator-runtime'
function Bestbet(props) {
  const [loading, setLoading] = useState(false)
  const [bestBetList, setBestBetList] = useState([])
  const [bbBeingEdited, setBbBeingEdited] = useState({
    id: '',
    linkedContentId: '',
    linkedContentTitle: '',
    linkedContentHref: '',
    searchWords: ['']
  })

  const [showDeleteSearchWordModal, setShowDeleteSearchWordModal] = useState(false)
  const handleCloseDeleteSearchWordModal = () => setShowDeleteSearchWordModal(false)

  const [showEditSearchWordsModal, setShowEditSearchWordsModal] = useState(false)
  const handleCloseEditSearchWordModal = () => setShowEditSearchWordsModal(false)

  const [inputTag, setInputTag] = useState('')
  const [searchWordsList, setSearchWordsList] = useState([])
  const [bestBetContent, setBestBetContent] = useState({})
  const [selectedSearchWord, setSelectedSearchWord] = useState('')

  useEffect(() => {
    fetchBestBetList()
  }, [])

  function fetchBestBetList() {
    setLoading(true)
    get(props.bestBetListServiceUrl, {
      params: {
        start: 0,
        count: 100
      }
    })
      .then((res) => {
        setBestBetList(res.data)
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }

  function handleUpdate() {
    setShowEditSearchWordsModal(false)

    setLoading(true)
    post(props.bestBetListServiceUrl, bbBeingEdited)
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
        fetchBestBetList()
      })
  }

  function handleCreate() {
    const updatedBestBetItem = {
      linkedContentId: bestBetContent.value,
      linkedContentTitle: bestBetContent.label,
      searchWords: searchWordsList
    }

    console.log('GLNRBN: ' + JSON.stringify(updatedBestBetItem, null, 2))

    setLoading(true)
    post(props.bestBetListServiceUrl, updatedBestBetItem)
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
        fetchBestBetList()
      })
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
          <p>Vil du fjerne {selectedSearchWord} fra innholdet?</p>
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
            {bbBeingEdited.searchWords.length ?
              <Row>
                <Col className="d-flex flex-wrap mt-3">
                  {bbBeingEdited.searchWords.map((searchWord) => renderSearchWord(searchWord, true))}
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
                <Button primary onClick={() => {
                  setBbBeingEdited({
                    id: bbBeingEdited.id,
                    linkedContentId: bbBeingEdited.linkedContentId,
                    linkedContentTitle: bbBeingEdited.linkedContentTitle,
                    linkedContentHref: bbBeingEdited.linkedContentHref,
                    searchWords: [...bbBeingEdited.searchWords, inputTag]
                  })
                }} className="mt-3">Legg til</Button>
              </Col>
            </Row>
          </>
        }
        footer={
          <>
            <Button primary onClick={handleUpdate}>Lagre</Button>
            <Button onClick={handleCloseEditSearchWordModal}>Lukk</Button>
          </>
        }
      />
    )
  }

  function handleEditSearchWordOnClick(item) {
    setShowEditSearchWordsModal(true)
    setBbBeingEdited(item)
  }

  function handleTagInput(event) {
    setInputTag(event)
  }

  function handleRemoveEditTag(tag) {
    setBbBeingEdited({
      id: bbBeingEdited.id,
      linkedContentId: bbBeingEdited.linkedContentId,
      linkedContentTitle: bbBeingEdited.linkedContentTitle,
      linkedContentHref: bbBeingEdited.linkedContentHref,
      searchWords: bbBeingEdited.searchWords.filter((word) => word !== tag)
    })
  }

  function handleTagSubmit() {
    setSearchWordsList([...searchWordsList, inputTag])
  }

  function handleContentSelect(event) {
    setBestBetContent(event)
  }

  async function searchForTerm(inputValue = '') {
    const result = await axios.get(props.contentSearchServiceUrl, {
      params: {
        query: inputValue
      }
    })
    const hits = result.data.hits
    return hits
  }

  const promiseOptions = (inputValue) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(searchForTerm(inputValue))
      }, 1000)
    })

  function renderForm() {
    return (
      <Col className="bestbet-list ml-4">
        <Title size={2}>Lag nytt best-bet</Title>
        <AsyncSelect cacheOptions defaultOptions loadOptions={promiseOptions} onChange={handleContentSelect} />
        {searchWordsList.length ?
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
            <Button primary onClick={handleCreate} className="mt-3 mx-0">Fullfør</Button>
          </Col>
        </Row>
      </Col>
    )
  }

  function renderBestbetList() {
    if (loading) {
      return <span className="spinner-border spinner-border" />
    } else {
      return (
        <>
          <Row>
            <Col className="col-6">
              <Title size={2}>Liste med innhold</Title>
            </Col>
            <Col>
              <Title size={2}>Nøkkelord</Title>
            </Col>
          </Row>
          <Row>
            <Col>
              <Divider light className="mt-2 mb-4"/>
            </Col>
          </Row>
          {bestBetList.length ? bestBetList.map((bet, index) => renderListItem(bet, index)) : null}
        </>
      )
    }
  }

  function renderSearchWord(searchWord, isInEditModal, disabled) {
    if (!disabled) {
      const searchWordOnClickCallback = isInEditModal ? () => handleRemoveEditTag(searchWord) : () => handleSearchWordOnClick(searchWord)
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
      <>
        <Row>
          <Col className="col-6">
            <li>
              <Link isExternal={true}
                href={'/admin/tool/com.enonic.app.contentstudio/main#/default/edit/' + item.linkedContentId}>
                {item.linkedContentTitle}
              </Link>
            </li>
          </Col>

          <Col>
            <div className="d-flex flex-wrap">
              {item.searchWords.map((searchWord) => renderSearchWord(searchWord, false, true))}
              <Tag className="m-1" onClick={() => handleEditSearchWordOnClick(item)}>
              Rediger<Edit size={16} className="ml-1" />
              </Tag>
            </div>
          </Col>
        </Row>
        <Row>
          <Col>
            <Divider light className="my-4"/>
          </Col>
        </Row>
      </>
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
      <Row className="justify-content-between">
        <Col className="col-8 bestbet-list">
          {renderBestbetList()}
        </Col>
        {renderForm()}
      </Row>
    </Container>
  )
}

Bestbet.propTypes = {
  logoUrl: PropTypes.string,
  bestBetListServiceUrl: PropTypes.string,
  contentSearchServiceUrl: PropTypes.string
}

export default (props) => <Bestbet {...props} />

