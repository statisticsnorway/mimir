import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Container, Row, Col } from 'react-bootstrap'
import { Title, Link, Tag, Input, TextArea, Dropdown, Button, Divider } from '@statisticsnorway/ssb-component-library'
import { XCircle, Edit, Trash } from 'react-feather'
import BestBetModal from './BestBetModal'
import axios from 'axios'
// import AsyncSelect from 'react-select/async'
// import 'regenerator-runtime'

function Bestbet(props) {
  const [loading, setLoading] = useState(false)
  const [bestBetList, setBestBetList] = useState([])

  const [showCreateBestBetModal, setShowCreateBestBetModal] = useState(false)
  const handleCloseCreateBestBetModal = () => setShowCreateBestBetModal(false)

  const [showEditSearchWordsModal, setShowEditSearchWordsModal] = useState(false)
  const handleCloseEditSearchWordModal = () => setShowEditSearchWordsModal(false)

  const [urlInputValue, setUrlInputValue] = useState('')
  const [titleInputValue, setTitleInputValue] = useState('')
  const [ingressInputValue, setIngressInputValue] = useState('')
  const [contentTypeValue, setContentTypeValue] = useState('')
  const [mainSubjectValue, setMainSubjectValue] = useState('')
  const [startDate, setStartDate] = useState(new Date())
  const [searchWordTag, setSearchWordTag] = useState('')
  const [bestBetContent, setBestBetContent] = useState({})
  const [searchWordsList, setSearchWordsList] = useState([])

  const emptyBet = {
    id: '',
    // linkedContentId: '',
    linkedContentTitle: '',
    linkedContentHref: '',
    linkedContentIngress: '',
    linkedContentType: '',
    linkedContentDate: '',
    linkedContentSubject: '',
    searchWords: ['']
  }
  const [bbBeingEdited, setBbBeingEdited] = useState(emptyBet)

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
    setShowCreateBestBetModal(false)

    // const updatedBestBetItem = {
    //   linkedContentId: bestBetContent.value,
    //   linkedContentTitle: bestBetContent.label,
    //   searchWords: searchWordsList
    // }

    const updatedBestBetItem = {
      linkedContentTitle: titleInputValue,
      linkedContentHref: urlInputValue,
      linkedContentIngress: ingressInputValue,
      linkedContentType: contentTypeValue,
      linkedContentDate: '',
      linkedContentSubject: mainSubjectValue,
      searchWords: searchWordsList
    }
    console.log(updatedBestBetItem)

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

  function handleDelete(key) {
    axios.delete(props.bestBetListServiceUrl, {
      params: {
        key: key
      }
    }).then(() => fetchBestBetList())
  }

  function handleEditSearchWordOnClick(item) {
    setShowEditSearchWordsModal(true)
    setBbBeingEdited(item)
  }

  function handleInputChange(event, type) {
    if (type === 'url') setUrlInputValue(event)
    if (type === 'title') setTitleInputValue(event)
    if (type === 'ingress') setIngressInputValue(event)
    if (type === 'date') setStartDate(event)
    if (type === 'searchWord') setSearchWordTag(event)
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

  function renderEditSearchWordModal() {
    return (
      <BestBetModal
        show={showEditSearchWordsModal}
        onHide={handleCloseEditSearchWordModal}
        title="Rediger nøkkelord"
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
                  handleChange={handleInputChange}
                  value={searchWordTag}
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
                    searchWords: [...bbBeingEdited.searchWords, searchWordTag]
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

  function renderForm() {
    return (
      <BestBetModal
        show={showCreateBestBetModal}
        onHide={handleCloseCreateBestBetModal}
        title="Lag nytt best-bet"
        body={
          <Col className="best-bet-form">
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
                  onSelect={(item) => setContentTypeValue(item.title)}
                />
                <Dropdown
                  header="Emne"
                  items={props.mainSubjects}
                  onSelect={(item) => setMainSubjectValue(item.title)}
                />
                <Input
                  label="Dato"
                  type="date"
                  handleChange={(e) => {
                    handleInputChange(e, 'date')
                    console.log(startDate)
                  }}
                  value={startDate}
                />
              </Col>
            </Row>
            {/* <AsyncSelect cacheOptions defaultOptions loadOptions={promiseOptions} onChange={handleContentSelect} /> */}
            {searchWordsList.length ?
              <Row>
                <Col className="d-flex flex-wrap">
                  {searchWordsList.map((searchWord) => renderSearchWord(searchWord))}
                </Col>
              </Row> : null}
            <Row>
              <Col className="d-flex align-items-center flex-row">
                <Input
                  className="m-0 pr-3"
                  label="Nøkkelord"
                  handleChange={(e) => handleInputChange(e, 'searchWord')}
                  value={searchWordTag}
                />
                <Button primary onClick={handleTagSubmit} className="mt-3">Legg til</Button>
              </Col>
            </Row>
          </Col>
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

  function renderListItem(item) {
    return (
      <>
        <Row>
          <Col className="col-6">
            <li className="d-flex flex-row align-items-center">
              <div className="best-bet-url-wrapper pr-1">
                <Link isExternal={true}
                  href={props.contentStudioBaseUrl + item.linkedContentHref}>
                  {item.linkedContentTitle}
                </Link>
              </div>
              <Tag className="m-1" onClick={() => handleEditSearchWordOnClick(item)}>
                Rediger
                <Edit size={16} className="ml-1" />
              </Tag>
            </li>
          </Col>

          <Col>
            <div className="d-flex flex-wrap">
              {item.searchWords.map((searchWord) => renderSearchWord(searchWord, true))}
            </div>
          </Col>
          <Col>
            <Button onClick={() => handleDelete(item.id)}>Slett<Trash size={16} className="ml-1" /></Button>
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
            onClick={() => setShowCreateBestBetModal(true)}
            primary
          >
            Ny Bestbet
          </Button>
          <Divider className="pb-3" light />
          {renderBestbetList()}
        </Col>
        {renderForm()}
        {renderEditSearchWordModal()}
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

