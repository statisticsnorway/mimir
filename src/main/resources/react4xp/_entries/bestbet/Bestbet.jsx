import React, { useState, useEffect, useReducer } from 'react'
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

  const [isXPContent, setIsXPContent] = useState(true)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const initialFormState = {
    bestBetId: '',
    selectedContentResult: null,
    urlInputValue: '',
    titleInputValue: '',
    ingressInputValue: '',
    contentTypeValue: '',
    mainSubjectValue: '',
    startDateValue: '',
    searchWordTag: '',
    searchWordsList: []
  }

  const formReducer = (state, action) => {
    switch (action.type) {
    case 'handle':
      return {
        ...state,
        [action.inputName]: action.value
      }
    case 'set':
      return action.setState
    case 'init':
      return initialFormState
    default:
      throw newError()
    }
  }
  const [formState, dispatch] = useReducer(formReducer, initialFormState)

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
      id: formState.bestBetId,
      linkedSelectedContentResult: formState.selectedContentResult,
      linkedContentTitle: formState.titleInputValue,
      linkedContentHref: formState.urlInputValue,
      linkedContentIngress: formState.ingressInputValue,
      linkedContentType: formState.contentTypeValue,
      linkedContentDate: formState.startDateValue,
      linkedContentSubject: formState.mainSubjectValue,
      searchWords: formState.searchWordsList
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
      linkedSelectedContentResult: formState.selectedContentResult,
      linkedContentTitle: formState.titleInputValue,
      linkedContentHref: formState.urlInputValue,
      linkedContentIngress: formState.ingressInputValue,
      linkedContentType: formState.contentTypeValue,
      linkedContentDate: formState.startDateValue,
      linkedContentSubject: formState.mainSubjectValue,
      searchWords: formState.searchWordsList
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
    dispatch({
      type: 'set',
      setState: {
        bestBetId: item.id,
        selectedContentResult: item.linkedSelectedContentResult,
        titleInputValue: item.linkedContentTitle,
        urlInputValue: item.linkedContentHref,
        ingressInputValue: item.linkedContentIngress,
        startDateValue: item.linkedContentDate,
        contentTypeValue: item.linkedContentType,
        mainSubjectValue: item.linkedContentSubject,
        searchWordTag: '',
        searchWordsList: item.searchWords
      }
    })

    setShowEditBestBetModal(true)
    if (item.linkedSelectedContentResult) {
      setIsXPContent(true)
    } else {
      setIsXPContent(false)
    }
  }

  function handleCreateBestBetOnClick() {
    setShowCreateBestBetModal(true)
    // clear edit best bet input data
    dispatch({
      type: 'init'
    })
  }

  function handleDeleteBestBetOnClick(item) {
    setShowDeleteBestBetModal(true)
    setSelectedBestBet(item)
  }

  function handleInputChange(event, type) {
    dispatch({
      type: 'handle',
      inputName: type,
      value: event
    })
  }

  function handleTag(action, tag) {
    dispatch({
      type: 'handle',
      inputName: 'searchWordsList',
      value: action === 'submit' ?
        [...formState.searchWordsList, formState.searchWordTag] :
        formState.searchWordsList.filter((word) => word !== tag)
    })
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
    dispatch({
      type: 'handle',
      inputName: 'selectedContentResult',
      value: event
    })
  }

  function handleDatoTypeSelect(type) {
    if (type === 'date-select-manual') {
      setShowDatePicker(true)
    } else {
      setShowDatePicker(false)
      dispatch({
        type: 'handle',
        inputName: 'startDateValue',
        value: type === 'date-select-xp' ? 'xp' : ''
      })
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
        <Tag className="m-1" onClick={() => handleTag('delete', searchWord)}>
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

  const ssbGreen4 = '#00824d'
  const ssbDark6 = '#162327'
  const borderDark = `1px solid ${ssbDark6}`
  const customAsyncSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      boxShadow: 'none',
      border: 'none',
      borderRadius: 'none',
      outline: state.isFocused && `2px solid ${ssbGreen4}`,
      outlineOffset: state.isFocused && '-1px'
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: ssbGreen4
    }),
    indicatorsContainer: (provided) => ({
      ...provided,
      border: borderDark,
      borderLeft: 'transparent',
      borderRadius: '0px',
      color: ssbGreen4
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: 'transparent'
    }),
    menu: (provided) => ({
      ...provided,
      margin: '0px',
      border: borderDark,
      borderRadius: '0px'
    }),
    menuList: (provided) => ({
      ...provided,
      padding: '0px'
    }),
    option: (provided, state) => ({
      backgroundColor: state.isSelected ? ssbGreen4 : (state.isFocused ? '#274247' : 'white'),
      fontWeight: state.isSelected && '700',
      color: state.isFocused || state.isSelected ? 'white' : ssbDark6,
      padding: '12px',
      opacity: 1
    }),
    placeholder: (provided) => ({
      ...provided,
      color: ssbDark6
    }),
    valueContainer: (provided) => ({
      ...provided,
      border: borderDark,
      borderRight: 'transparent',
      borderRadius: '0px',
      fontSize: '16px'
    })
  }

  function renderBestBetForm() {
    const selectedContentType = props.contentTypes.filter((contentType) => formState.contentTypeValue === contentType.title)[0]
    const selectedMainSubject = props.mainSubjects.filter((mainSubject) => formState.mainSubjectValue === mainSubject.title)[0]
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
        <Row className="d-flex flex-row align-items-end mb-3">
          <Col className="col-lg-10">
            <Input
              className="m-0"
              label="Best bet"
              handleChange={(e) => handleInputChange(e, 'searchWordTag')}
              value={formState.searchWordTag}
            />
          </Col>
          <Col className="d-flex justify-content-end">
            <Button primary onClick={() => handleTag('submit')}>Legg til</Button>
          </Col>
        </Row>
        {formState.searchWordsList.length ?
          <Row>
            <Col className="d-flex flex-wrap mb-3">
              {formState.searchWordsList.map((searchWord) => renderSearchWord(searchWord))}
            </Col>
          </Row> : null}
        <Row>
          <Col>
            {isXPContent &&
              <div id="content-selector-dropdown" className="ssb-dropdown mb-3">
                <label id="dropdown-label" htmlFor="react-select-3-input">Content selector</label>
                <AsyncSelect
                  className="dropdown-interactive-area"
                  placeholder="Søk ved å skrive..."
                  styles={customAsyncSelectStyles}
                  defaultInputValue={formState.selectedContentResult && formState.selectedContentResult.label}
                  cacheOptions
                  defaultOptions
                  loadOptions={promiseOptions}
                  onChange={handleContentSelect} />
              </div>}
            {!isXPContent &&
              <React.Fragment>
                <Input
                  label="Ekstern lenke"
                  handleChange={(e) => handleInputChange(e, 'urlInputValue')}
                  value={formState.urlInputValue}
                />
                <Input
                  label="Tittel"
                  handleChange={(e) => handleInputChange(e, 'titleInputValue')}
                  value={formState.titleInputValue}
                />
              </React.Fragment>}
            <TextArea
              label="Ingress"
              handleChange={(e) => handleInputChange(e, 'ingressInputValue')}
              value={formState.ingressInputValue}
            />
            <Dropdown
              header="Innholdstype"
              items={props.contentTypes}
              selectedItem={selectedContentType ? selectedContentType : props.contentTypes[0]}
              onSelect={(item) => handleInputChange(item.id !== '' ? item.title : '', 'contentTypeValue')}
            />
            <Dropdown
              header="Emne"
              items={props.mainSubjects}
              selectedItem={selectedMainSubject ? selectedMainSubject : props.mainSubjects[0]}
              onSelect={(item) => handleInputChange(item.id !== '' ? item.title : '', 'mainSubjectValue')}
            />
            {isXPContent &&
              <RadioGroup
                header="Velg dato format"
                onChange={handleDatoTypeSelect}
                selectedValue={formState.startDateValue ? formState.startDateValue === 'xp' ? 'date-select-xp' : 'date-select-manual' : 'date-select-none'}
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
                handleChange={(e) => handleInputChange(e, 'startDateValue')}
                value={formState.startDateValue}
              />}
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
        title="Rediger best bet"
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
        title="Lag nytt best bet"
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
        title="Slett best bet"
        body={
          <p>Har du lyst til å slette&nbsp;
          &laquo;
          {selectedBestBet.linkedSelectedContentResult ? selectedBestBet.linkedSelectedContentResult.title : selectedBestBet.linkedContentTitle}
          &raquo;?
          </p>
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
