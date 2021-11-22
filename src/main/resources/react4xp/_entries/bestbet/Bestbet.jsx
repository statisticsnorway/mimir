import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, Link, Tag, Input, Button, Divider } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit, Trash } from 'react-feather'
import EditSearchWordsModal from './EditSearchWordsModal'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import 'regenerator-runtime'
function Bestbet(props) {
  const [loading, setLoading] = useState(false)
  const [bestBetList, setBestBetList] = useState([])

  const [showEditSearchWordsModal, setShowEditSearchWordsModal] = useState(false)
  const handleCloseEditSearchWordModal = () => setShowEditSearchWordsModal(false)

  const [inputTag, setInputTag] = useState('')
  const [bestBetContent, setBestBetContent] = useState({})
  const [searchWordsList, setSearchWordsList] = useState([])

  const [bbBeingEdited, setBbBeingEdited] = useState({
    id: '',
    linkedContentId: '',
    linkedContentTitle: '',
    linkedContentHref: '',
    searchWords: ['']
  })

  useEffect(() => {
    fetchBestBetList()
  }, [])

  function fetchBestBetList() {
    setLoading(true)
    axios.get(props.bestBetListServiceUrl, {
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
    axios.post(props.bestBetListServiceUrl, bbBeingEdited)
      .then(() => {
        fetchBestBetList()
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setLoading(false))
  }

  function handleCreate() {
    const updatedBestBetItem = {
      linkedContentId: bestBetContent.value,
      linkedContentTitle: bestBetContent.label,
      searchWords: searchWordsList
    }

    setLoading(true)
    axios.post(props.bestBetListServiceUrl, updatedBestBetItem)
      .then(() => {
        fetchBestBetList()
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => setLoading(false)
      )
  }

  function deleteBestBet(key) {
    axios.delete(props.bestBetListServiceUrl, {
      params: {
        key: key
      }
    }).then(() => fetchBestBetList())
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
                  {bbBeingEdited.searchWords.map((searchWord) => renderSearchWord(searchWord))}
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
            <Button primary onClick={() => handleCreate()} className="mt-3 mx-0">Fullfør</Button>
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
            <Col>
              <Title size={2}></Title>
            </Col>
          </Row>
          <Row>
            <Col>
              <Divider light className="mt-2 mb-4"/>
            </Col>
          </Row>
          {bestBetList.length ? bestBetList.map((bet) => renderListItem(bet)) : null}
        </>
      )
    }
  }

  function renderSearchWord(searchWord, disabled) {
    if (!disabled) {
      return (
        <Tag className="m-1" onClick={() => handleRemoveEditTag(searchWord)}>
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
                href={props.contentStudioBaseUrl + item.linkedContentHref}>
                {item.linkedContentTitle}
              </Link>
            </li>
          </Col>

          <Col>
            <div className="d-flex flex-wrap">
              {item.searchWords.map((searchWord) => renderSearchWord(searchWord, true))}
              <Tag className="m-1" onClick={() => handleEditSearchWordOnClick(item)}>
              Rediger<Edit size={16} className="ml-1" />
              </Tag>
            </div>
          </Col>
          <Col>
            <Button onClick={() => deleteBestBet(item.id)}>Slett<Trash size={16} className="ml-1" /></Button>
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
  contentSearchServiceUrl: PropTypes.string,
  contentStudioBaseUrl: PropTypes.string
}

export default (props) => <Bestbet {...props} />

