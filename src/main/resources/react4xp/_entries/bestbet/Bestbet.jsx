import React, { useState, useEffect, useReducer, createContext } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, Link, Tag, Button, Divider } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit, Trash, Plus } from 'react-feather'
import BestBetModal from './BestBetModal'
import BestBetForm from './BestBetForm'
import axios from 'axios'

export const BestBetContext = createContext()
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

  const initialFormState = {
    bestBetId: '',
    selectedContentResult: null,
    urlInputValue: '',
    titleInputValue: '',
    ingressInputValue: '',
    contentTypeValue: '',
    mainSubjectValue: '',
    englishMainSubjectValue: '',
    startDateValue: '',
    searchWordTag: '',
    searchWordsList: [],
    isXPContent: true,
    showDatePicker: false
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
      linkedEnglishContentSubject: formState.englishMainSubjectValue,
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
      linkedEnglishContentSubject: formState.englishMainSubjectValue,
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
        englishMainSubjectValue: item.englishMainSubjectValue,
        searchWordTag: '',
        searchWordsList: item.searchWords
      }
    })

    setShowEditBestBetModal(true)
    if (item.linkedSelectedContentResult) {
      dispatch({
        type: 'handle',
        inputName: 'isXPContent',
        value: true
      })
    } else {
      dispatch({
        type: 'handle',
        inputName: 'isXPContent',
        value: false
      })
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

  function handleTag(action, tag) {
    dispatch({
      type: 'handle',
      inputName: 'searchWordsList',
      value: action === 'submit' ?
        [...formState.searchWordsList, formState.searchWordTag] :
        formState.searchWordsList.filter((word) => word !== tag)
    })
  }

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

  function renderEditBestBetModal() {
    return (
      <BestBetModal
        show={showEditBestBetModal}
        onHide={handleCloseEditBestBetModal}
        title="Rediger best bet"
        body={
          <BestBetForm
            bestBetListServiceUrl={props.bestBetListServiceUrl}
            contentSearchServiceUrl={props.contentSearchServiceUrl}
            contentTypes={props.contentTypes}
            mainSubjects={props.mainSubjects}
            mainSubjectsEnglish={props.mainSubjectsEnglish}
            renderSearchWord={renderSearchWord}
            handleTag={handleTag}
          />
        }
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
          <BestBetForm
            bestBetListServiceUrl={props.bestBetListServiceUrl}
            contentSearchServiceUrl={props.contentSearchServiceUrl}
            contentTypes={props.contentTypes}
            mainSubjects={props.mainSubjects}
            mainSubjectsEnglish={props.mainSubjectsEnglish}
            renderSearchWord={renderSearchWord}
            handleTag={handleTag}
          />
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
    <BestBetContext.Provider value={{
      formState,
      dispatch
    }}>
      <Container fluid>
        <Row className="bestbet-header">
          <Col className="flex-row align-items-center">
            <img src={props.logoUrl} className="logo" />
            <Title size={1}>Best bet søk</Title>
          </Col>
        </Row>
        <Row className="justify-content-between">
          <Col className="col-12 bestbet-list">
            <Button
              className="mb-4"
              onClick={handleCreateBestBetOnClick}
              primary
            >
            Ny Best bet
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
    </BestBetContext.Provider>
  )
}

Bestbet.propTypes = {
  logoUrl: PropTypes.string,
  bestBetListServiceUrl: PropTypes.string,
  contentSearchServiceUrl: PropTypes.string,
  contentStudioBaseUrl: PropTypes.string,
  mainSubjectsEnglish: PropTypes.array,
  contentTypes: PropTypes.array,
  mainSubjects: PropTypes.array
}

export default (props) => <Bestbet {...props} />
