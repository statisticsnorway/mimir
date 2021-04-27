import React, { useState } from 'react'
import { Button, Divider, Input, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Col, Container, Row, Form } from 'react-bootstrap'
import axios from 'axios'

/* TODO
- Etternavn må få rett visning av beste-treff
- Styling og presentasjon
- Tekst for "Det er 0-3 personer som heter... "
- Skjule mindre interessante resultater - må sikkert diskuteres noen runder med Siv og Ina
*/

function NameSearch(props) {
  const [name, setName] = useState({
    error: false,
    errorMessage: props.phrases.errorMessage,
    value: ''
  })
  const [result, setResult] = useState(null)
  const [typeUsedInMainResult, setTypeUsedInMainResult] = useState(undefined)

  function renderMainResult(docs) {
    return docs.filter((doc) => doc.name === name.value.toUpperCase()) // only get result with same name as the input
      .reduce((acc, current) => {
        if (acc.length === 0 || current.count > acc.count) {
          console.log()
          acc = [current] // get the hit with the highest count
        }
        return acc
      }, [])
      .map((doc, i) => { // render
        setTypeUsedInMainResult(doc.type)
        return (
          <Row key={i}>
            <Col>
              <p className="result-highlight my-4">
                { parseResultText(doc.count, doc.name, doc.type) }
              </p>
            </Col>
          </Row>
        )
      })
  }

  function renderSubResult(docs) {
    docs.filter((doc) => doc.type !== typeUsedInMainResult).map( (doc, i) => {
      return (
        <li key={i} className="my-1">
          { name.value && parseResultText(doc.count, doc.name, doc.type)}
        </li>
      )
    })
  }

  function renderResult() {
    return (result && <div>
      <Container className="name-search-result p-5">
        <Row>
          <Col>
            <h3>{props.phrases.nameSearchResultTitle}</h3>
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
  function parseResultText(count, name, nameCode) {
    return `${props.phrases.nameSearchResultText
      .replace('{0}', count)
      .replace('{1}', name)} ${translateName(nameCode)}.`
  }

  function translateName(nameCode) {
    return props.phrases.types[nameCode]
  }

  function handleSubmit(form) {
    form.preventDefault()

    axios.get(
      props.urlToService, {
        params: {
          name: name.value
        }
      }
    ).then((res) =>{
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
    <section className="name-search container-fluid">
      <Container className="name-search-input p-5">
        <Row>
          <Col>
            {
              props.aboutLink && props.aboutLink.url &&
              <Link className="float-right" href={props.aboutLink.url}>{props.aboutLink.title}</Link>
            }
            <h3>{props.phrases.nameSearchTitle}</h3>
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
            <Col>
              <Button type="submit">{props.phrases.nameSearchButtonText}</Button>
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
    nameSearchResultText: PropTypes.string,
    errorMessage: PropTypes.string,
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


