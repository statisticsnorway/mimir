import React, { useState } from 'react'
import { Button, Divider, Input, Link, Title } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Col, Container, Row, Form } from 'react-bootstrap'
import axios from 'axios'

/* TODO
- Etternavn må få rett visning av beste-treff
- Skjule mindre interessante resultater - må sikkert diskuteres noen runder med Siv og Ina
*/

function NameSearch(props) {
  const [name, setName] = useState({
    error: false,
    errorMessage: props.phrases.errorMessage,
    value: ''
  })
  const [result, setResult] = useState(null)
  const [mainResult, setMainResult] = useState(undefined)
  const [searchedTerm, setSearchedTerm] = useState('')

  function findMainResult(docs, originalName) {
    // only get result with same name as the input
    const filteredResult = docs.filter((doc) => doc.name === originalName.toUpperCase())
    const mainRes = filteredResult.length && filteredResult.reduce((acc, current) => {
      if (!acc || acc.count < current.count ) {
        acc = current // get the hit with the highest count
      }
      return acc
    })
    setMainResult(mainRes)
  }

  function renderMainResult() {
    return (
      <Row>
        <Col>
          <p className="result-highlight my-4">
            { !mainResult || mainResult.count <= 3 ? parseThreeOrLessText() : parseResultText(mainResult) }
          </p>
        </Col>
      </Row>
    )
  }

  function renderSubResult(docs) {
    return docs.filter((doc) => doc.type !== mainResult.type).map( (doc, i) => {
      return (
        <li key={i} className="my-1">
          { parseResultText(doc) }
        </li>
      )
    })
  }

  function renderResult() {
    return (result && <div>
      <Container className="name-search-result">
        <Row>
          <Col>
            <Title size={3} className="result-title mb-1">{props.phrases.nameSearchResultTitle}</Title>
            <Divider dark/>
          </Col>
        </Row>
        { result.response && renderMainResult(result.response.docs) }
        <Row>
          <Col>
            <strong>{props.phrases.interestingFacts}</strong>
            <ul className="interesting-facts p-0">
              { result.response && renderSubResult(result.response.docs) }
            </ul>
          </Col>
        </Row>

      </Container>
    </div>
    )
  }
  function parseResultText(doc) {
    return (
      <span>
        {`${props.phrases.thereAre} `}
        <span className="details">{doc.count}</span>
        {` ${formatGender(doc.gender)} ${props.phrases.with} `}
        <span className="details name-search-name">{doc.name.toLowerCase()} </span>
        {` ${props.phrases.asTheir} ${translateName(doc.type)} `}
      </span> )
  }

  function formatGender(gender) {
    switch (gender) {
    case 'F':
      return props.phrases.women
    case 'M':
      return props.phrases.men
    default: return ''
    }
  }

  function parseThreeOrLessText() {
    return <span>
      {` ${props.phrases.threeOrLessText} `}
      <strong className="name-search-name">{searchedTerm}</strong>
      {`${props.phrases.asTheir} ${translateName(doc.type)}`}
    </span>
  }

  function translateName(nameCode) {
    return props.phrases.types[nameCode]
  }

  function handleSubmit(form) {
    form.preventDefault()
    setSearchedTerm(name.value)
    axios.get(
      props.urlToService, {
        params: {
          name: name.value
        }
      }
    ).then((res) => {
      console.log(res)
      findMainResult(res.data.response.docs, res.data.originalName)
      setResult(res.data)
    }
    ).catch((e) =>
      console.log(e)
    )
  }

  function handleChange(event) {
    setName({
      errorMessage: name.errorMessage,
      value: event,
      error: !isNameValid(event)
    })
  }

  function isNameValid(nameToCheck) {
    const invalidCharacters = nameToCheck && nameToCheck.match(/[^a-øA-Ø\-\s]/gm)
    return !invalidCharacters
  }

  return (
    <section className="name-search container-fluid p-0">
      <Container className="name-search-input">
        <Row>
          <Col>
            <Title size={2}>{props.phrases.nameSearchTitle}</Title>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Input
                className="my-4"
                name="navn"
                label={props.phrases.nameSearchInputLabel}
                value={name.value}
                handleChange={handleChange}
                error={name.error}
                errorMessage={name.errorMessage}></Input>
            </Col>
          </Row>
          <Row>
            <Col lg md="12">
              <Button primary type="submit">{props.phrases.nameSearchButtonText}</Button>
            </Col>
            <Col lg md="12" className="d-lg-flex align-items-center justify-content-end">
              {
                props.aboutLink && props.aboutLink.url &&
              <Link href={props.aboutLink.url}>{props.aboutLink.title}</Link>
              }
            </Col>
          </Row>
        </Form>
      </Container>
      {renderResult()}
    </section>
  )
}

NameSearch.propTypes = {
  urlToService: PropTypes.string,
  aboutLink: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string
  }),
  phrases: PropTypes.shape({
    nameSearchTitle: PropTypes.string,
    nameSearchInputLabel: PropTypes.string,
    nameSearchButtonText: PropTypes.string,
    interestingFacts: PropTypes.string,
    nameSearchResultTitle: PropTypes.string,
    thereAre: PropTypes.string,
    with: PropTypes.string,
    asTheir: PropTypes.string,
    errorMessage: PropTypes.string,
    threeOrLessText: PropTypes.string,
    women: PropTypes.string,
    men: PropTypes.string,
    types: PropTypes.shape({
      firstgivenandfamily: PropTypes.string,
      middleandfamily: PropTypes.string,
      family: PropTypes.string,
      onlygiven: PropTypes.string,
      onlygivenandfamily: PropTypes.string,
      firstgiven: PropTypes.string
    })
  })
}

export default (props) => <NameSearch {...props} />


