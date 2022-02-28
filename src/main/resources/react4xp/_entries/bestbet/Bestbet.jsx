import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, Link, Tag, Input, TextArea, Dropdown, Button, Divider } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit, Trash, Plus } from 'react-feather'
import BestBetModal from './BestBetModal'
import axios from 'axios'
// import AsyncSelect from 'react-select/async'
// import 'regenerator-runtime'

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
  const [urlInputValue, setUrlInputValue] = useState('')
  const [titleInputValue, setTitleInputValue] = useState('')
  const [ingressInputValue, setIngressInputValue] = useState('')
  const [contentTypeValue, setContentTypeValue] = useState('')
  const [mainSubjectValue, setMainSubjectValue] = useState('')
  const [startDateValue, setStartDateValue] = useState(new Date())
  const [searchWordTag, setSearchWordTag] = useState('')
  const [searchWordsList, setSearchWordsList] = useState([])

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
    setTitleInputValue(item.linkedContentTitle)
    setUrlInputValue(item.linkedContentHref)
    setIngressInputValue(item.linkedContentIngress)
    setStartDateValue(item.linkedContentDate)
    setContentTypeValue(item.linkedContentType)
    setMainSubjectValue(item.linkedContentSubject)
    setSearchWordTag('')
    setSearchWordsList(item.searchWords)
  }

  function handleCreateBestBetOnClick() {
    setShowCreateBestBetModal(true)
    // clear edit best bet input data
    setTitleInputValue('')
    setUrlInputValue('')
    setIngressInputValue('')
    setStartDateValue('')
    setContentTypeValue('')
    setMainSubjectValue('')
    setSearchWordTag('')
    setSearchWordsList('')
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

  // function handleContentSelect(event) {
  //   setBestBetContent(event)
  // }

  // async function searchForTerm(inputValue = '') {
  //   const result = await axios.get(props.contentSearchServiceUrl, {
  //     params: {
  //       query: inputValue
  //     }
  //   })
  //   const hits = result.data.hits
  //   return hits
  // }

  // const promiseOptions = (inputValue) =>
  //   new Promise((resolve) => {
  //     setTimeout(() => {
  //       resolve(searchForTerm(inputValue))
  //     }, 1000)
  //   })

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

  function renderBestBetForm() {
    const selectedContentType = props.contentTypes.filter((contentType) => contentTypeValue === contentType.title)[0]
    const selectedMainSubject = props.mainSubjects.filter((mainSubject) => mainSubjectValue === mainSubject.title)[0]
    return (
      <div className="best-bet-form">
        <Row>
          <Col>
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
            <Input
              label="Dato"
              type="date"
              handleChange={(e) => handleInputChange(e, 'date')}
              value={startDateValue}
            />
          </Col>
        </Row>
        {searchWordsList.length ?
          <Row>
            <Col className="d-flex flex-wrap mb-3">
              {searchWordsList.map((searchWord) => renderSearchWord(searchWord))}
            </Col>
          </Row> : null}
        <Row>
          <Col className="d-flex flex-row align-items-end">
            <Input
              className="m-0 pr-3"
              label="Nøkkelord"
              handleChange={(e) => handleInputChange(e, 'searchWord')}
              value={searchWordTag}
            />
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
          /* <AsyncSelect cacheOptions defaultOptions loadOptions={promiseOptions} onChange={handleContentSelect} /> */
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
                  href={props.contentStudioBaseUrl + item.linkedContentHref}>
                  {item.linkedContentTitle}
                </Link>
              </div>
              <Tag className="m-1" onClick={() => handleEditBestBetOnClick(item)}>
                Rediger
                <Edit size={16} className="ml-1" />
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
              <Trash size={16} className="ml-1" />
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
            <Plus size={16} className="ml-1" />
          </Button>
          <Divider className="pb-3" light />
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

