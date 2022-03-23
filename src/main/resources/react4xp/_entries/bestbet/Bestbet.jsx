import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, Link, Tag, Input, TextArea, Dropdown, Button, Divider, Tabs, RadioGroup } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit, Trash, Plus } from 'react-feather'
import BestBetModal from './BestBetModal'
import axios from 'axios'
import AsyncSelect from 'react-select/async'
import 'regenerator-runtime'

function Bestbet(props) {
  const [loading, setLoading] = useState(false)
  const [bestBetList, setBestBetList] = useState([])
  const [selectedBestBet, setSelectedBestBet] = useState({})

  const [showCreateBestBetModal, setShowCreateBestBetModal] = useState(false)
  const handleCloseCreateBestBetModal = () => setShowCreateBestBetModal(false)

  const [showEditBestBetModal, setShowEditBestBetModal] = useState(false)
  const handleCloseEditBestBetModal = () => setShowEditBestBetModal(false)

  const [showDeleteBestBetModal, setShowDeleteBestBetModal] = useState(false)
  const handleCloseDeleteBestBetModal = () => setShowDeleteBestBetModal(false)

  const [bestBetId, setBestBetId] = useState('')
  const [selectedContentResult, setSelectedContentResult] = useState(null)
  const [urlInputValue, setUrlInputValue] = useState('')
  const [titleInputValue, setTitleInputValue] = useState('')
  const [ingressInputValue, setIngressInputValue] = useState('')
  const [contentTypeValue, setContentTypeValue] = useState('')
  const [mainSubjectValue, setMainSubjectValue] = useState('')
  const [startDateValue, setStartDateValue] = useState('')
  const [searchWordTag, setSearchWordTag] = useState('')
  const [searchWordsList, setSearchWordsList] = useState([])

  const [isXPContent, setIsXPContent] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const initialState = {
    bestBetId: '',
    selectedContentResult: null,
    urlInputValue: '',
    titleInputValue: '',
    ingressInputValue: '',
    contentTypeValue: '',
    mainSubjectValue: '',
    startDateValue: '',
    searchWordTag: '',
    searchWordsList: [],
    isXPContent: true,
    showDatePicker: false
  }

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
    setShowEditBestBetModal(false)
    setLoading(true)
    axios.post(props.bestBetListServiceUrl, {
      id: bestBetId,
      linkedSelectedContentResult: selectedContentResult,
      linkedContentTitle: titleInputValue,
      linkedContentHref: urlInputValue,
      linkedContentIngress: ingressInputValue,
      linkedContentType: contentTypeValue,
      linkedContentDate: startDateValue,
      linkedContentSubject: mainSubjectValue,
      searchWords: searchWordsList
    })
      .then(() => {
        fetchBestBetList()
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleCreate() {
    setShowCreateBestBetModal(false)
    setLoading(true)
    axios.post(props.bestBetListServiceUrl, {
      linkedSelectedContentResult: selectedContentResult,
      linkedContentTitle: titleInputValue,
      linkedContentHref: urlInputValue,
      linkedContentIngress: ingressInputValue,
      linkedContentType: contentTypeValue,
      linkedContentDate: startDateValue,
      linkedContentSubject: mainSubjectValue,
      searchWords: searchWordsList
    })
      .then(() => {
        setTimeout(() => {
          fetchBestBetList()
        }, 1000)
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  function handleDelete() {
    setShowDeleteBestBetModal(false)
    axios.delete(props.bestBetListServiceUrl, {
      params: {
        key: selectedBestBet.id
      }
    }).then(() => fetchBestBetList())
  }

  function handleEditBestBetOnClick(item) {
    setShowEditBestBetModal(true)
    setBestBetId(item.id)
    setSelectedContentResult(item.linkedSelectedContentResult)
    setTitleInputValue(item.linkedContentTitle)
    setUrlInputValue(item.linkedContentHref)
    setIngressInputValue(item.linkedContentIngress)
    setStartDateValue(item.linkedContentDate)
    setContentTypeValue(item.linkedContentType)
    setMainSubjectValue(item.linkedContentSubject)
    setSearchWordTag('')
    setSearchWordsList(item.searchWords)

    if (item.linkedSelectedContentResult) {
      setIsXPContent(true)
    } else {
      setIsXPContent(false)
    }
  }

  function clearInputFields() {
    setSelectedContentResult(initialState.selectedContentResult)
    setTitleInputValue(initialState.titleInputValue)
    setUrlInputValue(initialState.urlInputValue)
    setIngressInputValue(initialState.ingressInputValue)
    setStartDateValue(initialState.startDateValue)
    setContentTypeValue(initialState.contentTypeValue)
    setMainSubjectValue(initialState.mainSubjectValue)
    setSearchWordTag(initialState.searchWordTag)
    setSearchWordsList(initialState.searchWordsList)
  }

  function handleCreateBestBetOnClick() {
    setShowCreateBestBetModal(true)
    // clear edit best bet input data
    clearInputFields()
  }

  function handleDeleteBestBetOnClick(item) {
    setShowDeleteBestBetModal(true)
    setSelectedBestBet(item)
  }

  function handleInputChange(event, type) {
    if (type === 'url') setUrlInputValue(event)
    if (type === 'title') setTitleInputValue(event)
    if (type === 'ingress') setIngressInputValue(event)
    if (type === 'date') setStartDateValue(event)
    if (type === 'searchWord') setSearchWordTag(event)
  }

  function handleRemoveEditTag(tag) {
    setSearchWordsList(searchWordsList.filter((word) => word !== tag))
  }

  function handleTagSubmit() {
    setSearchWordsList([...searchWordsList, searchWordTag])
  }

  function handleTabOnClick(item) {
    if (item === 'xp-content') {
      setIsXPContent(true)
    }

    if (item === '4.7-content') {
      setIsXPContent(false)
    }
  }

  function handleContentSelect(event) {
    setSelectedContentResult(event)
  }

  function handleDatoTypeSelect(value) {
    if (value === 'date-select-manual') {
      setShowDatePicker(true)
    }

    if (value === 'date-select-xp') {
      setShowDatePicker(false)
      setStartDateValue('xp') // Converts to the correct date in search result view
    }

    if (value === 'date-select-none') {
      setShowDatePicker(false)
      setStartDateValue('')
    }
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

  function renderSearchWord(searchWord, disabled) {
    if (!disabled) {
      return (
        <Tag className="m-1" onClick={() => handleRemoveEditTag(searchWord)}>
          {searchWord}<XCircle size={16} className="ms-1" />
        </Tag>
      )
    }

    return (
      <div className="search-words m-1">
        {searchWord}
      </div>
    )
  }

  function renderBestBetForm() {
    const selectedContentType = props.contentTypes.filter((contentType) => contentTypeValue === contentType.title)[0]
    const selectedMainSubject = props.mainSubjects.filter((mainSubject) => mainSubjectValue === mainSubject.title)[0]
    return (
      <div className="best-bet-form">
        <Row className="mb-3">
          <Col>
            <Tabs
              activeOnInit={isXPContent ? 'xp-content' : '4.7-content'}
              items={[
                {
                  title: 'Velg XP innhold',
                  path: 'xp-content'
                },
                {
                  title: 'Legg til 4.7. innhold',
                  path: '4.7-content'
                }
              ]}
              onClick={handleTabOnClick}
            />
            <Divider />
          </Col>
        </Row>
        <Row>
          <Col>
            {isXPContent &&
              <div id="content-selector-dropdown" className="mb-3">
                <label htmlFor="react-select-3-input">Content selector</label>
                <AsyncSelect
                  defaultInputValue={selectedContentResult && selectedContentResult.label}
                  cacheOptions
                  defaultOptions
                  loadOptions={promiseOptions}
                  onChange={handleContentSelect} />
              </div>}
            {!isXPContent &&
              <React.Fragment>
                <Input
                  label="Ekstern lenke"
                  handleChange={(e) => handleInputChange(e, 'url')}
                  value={urlInputValue}
                />
                <Input
                  label="Tittel"
                  handleChange={(e) => handleInputChange(e, 'title')}
                  value={titleInputValue}
                />
              </React.Fragment>}
            <TextArea
              label="Ingress"
              handleChange={(e) => handleInputChange(e, 'ingress')}
              value={ingressInputValue}
            />
            <Dropdown
              header="Innholdstype"
              items={props.contentTypes}
              selectedItem={selectedContentType ? selectedContentType : props.contentTypes[0]}
              onSelect={(item) => setContentTypeValue(item.id !== '' ? item.title : '')}
            />
            <Dropdown
              header="Emne"
              items={props.mainSubjects}
              selectedItem={selectedMainSubject ? selectedMainSubject : props.mainSubjects[0]}
              onSelect={(item) => setMainSubjectValue(item.id !== '' ? item.title : '')}
            />
            {isXPContent &&
            <RadioGroup
              header="Velg dato format"
              onChange={handleDatoTypeSelect}
              selectedValue="date-select-manual"
              orientation="column"
              items={[
                {
                  label: 'Manuell innføring',
                  value: 'date-select-manual'
                },
                {
                  label: 'Hent fra XP innhold',
                  value: 'date-select-xp'
                },
                {
                  label: 'Ingen dato',
                  value: 'date-select-none'
                }
              ]}
            />
            }
            {(!isXPContent || showDatePicker) &&
              <Input
                label="Dato"
                type="date"
                handleChange={(e) => handleInputChange(e, 'date')}
                value={startDateValue}
              />}
          </Col>
        </Row>
        {searchWordsList.length ?
          <Row>
            <Col className="d-flex flex-wrap mb-3">
              {searchWordsList.map((searchWord) => renderSearchWord(searchWord))}
            </Col>
          </Row> : null}
        <Row className="d-flex flex-row align-items-end">
          <Col className="col-lg-10">
            <Input
              className="m-0"
              label="Nøkkelord"
              handleChange={(e) => handleInputChange(e, 'searchWord')}
              value={searchWordTag}
            />
          </Col>
          <Col className="d-flex justify-content-end">
            <Button primary onClick={handleTagSubmit}>Legg til</Button>
          </Col>
        </Row>
      </div>
    )
  }

  function renderEditBestBetModal() {
    return (
      <BestBetModal
        show={showEditBestBetModal}
        onHide={handleCloseEditBestBetModal}
        title="Rediger best-bet"
        body={renderBestBetForm()}
        footer={
          <>
            <Button primary onClick={handleUpdate}>Lagre</Button>
            <Button onClick={handleCloseEditBestBetModal}>
              Lukk
            </Button>
          </>
        }
      />
    )
  }

  function renderCreateBestBetModal() {
    return (
      <BestBetModal
        show={showCreateBestBetModal}
        onHide={handleCloseCreateBestBetModal}
        title="Lag nytt best-bet"
        body={
          renderBestBetForm()
        }
        footer={
          <>
            <Button primary onClick={handleCreate}>Fullfør</Button>
            <Button onClick={handleCloseCreateBestBetModal}>Lukk</Button>
          </>
        }
      />
    )
  }

  function renderDeleteBestBetModal() {
    return (
      <BestBetModal
        show={showDeleteBestBetModal}
        onHide={handleCloseDeleteBestBetModal}
        title="Slett best-bet"
        body={
          <p>Har du lyst til å slette {selectedBestBet.linkedContentTitle}?</p>
        }tt
        footer={
          <>
            <Button primary onClick={handleDelete}>Slett</Button>
            <Button onClick={handleCloseDeleteBestBetModal}>Lukk</Button>
          </>
        }
      />
    )
  }

  function renderListItem(item) {
    return (
      <>
        <Row>
          <Col className="col-6">
            <li className="d-flex flex-row align-items-center">
              <>
                <div className="best-bet-url-wrapper pr-1">
                  <Link isExternal={true}
                    href={item.linkedSelectedContentResult ? props.contentStudioBaseUrl + item.linkedSelectedContentResult.value : item.linkedContentHref}>
                    {item.linkedSelectedContentResult ? item.linkedSelectedContentResult.title : item.linkedContentTitle}
                  </Link>
                </div>
                <Tag className="m-1" onClick={() => handleEditBestBetOnClick(item)}>
                Rediger
                  <Edit size={16} className="ms-1" />
                </Tag>
              </>
            </li>
          </Col>

          <Col>
            <div className="d-flex flex-wrap">
              {item.searchWords.map((searchWord) => renderSearchWord(searchWord, true))}
            </div>
          </Col>
          <Col>
            <Button onClick={() => handleDeleteBestBetOnClick(item)}>
              Slett
              <Trash size={16} className="ms-1" />
            </Button>
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
              <Title size={2}>{/* Delete best bet row */}</Title>
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

  return (
    <Container fluid>
      <Row className="bestbet-header">
        <Col className="flex-row align-items-center">
          <img src={props.logoUrl} className="logo" />
          <Title size={1}>Best-bet søk</Title>
        </Col>
      </Row>
      <Row className="justify-content-between">
        <Col className="col-12 bestbet-list">
          <Button
            className="mb-4"
            onClick={handleCreateBestBetOnClick}
            primary
          >
            Ny Bestbet
            <Plus size={16} className="ms-1" />
          </Button>
          <Divider className="mb-3" light />
          {renderBestbetList()}
        </Col>
        {renderCreateBestBetModal()}
        {renderEditBestBetModal()}
        {renderDeleteBestBetModal()}
      </Row>
    </Container>
  )
}

Bestbet.propTypes = {
  logoUrl: PropTypes.string,
  bestBetListServiceUrl: PropTypes.string,
  contentSearchServiceUrl: PropTypes.string,
  contentStudioBaseUrl: PropTypes.string,
  contentTypes: PropTypes.array,
  mainSubjects: PropTypes.array
}

export default (props) => <Bestbet {...props} />

