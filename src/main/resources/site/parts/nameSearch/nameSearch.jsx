import React, { useState } from 'react'
import { Button, Divider, Input, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Col, Container, Row, Form } from 'react-bootstrap'
import axios from 'axios'

/* TODO
- tillate bokstaver med diakritisk tegn (é, ú etc)
- Etternavn må få rett visning av beste-treff
- Styling og presentasjon
- Tekst for "Det er 0-3 personer som heter... "
- Hente korrekte fraser for ulike situasjoner
- Backend som søker på både kombinasjonen av alle navn som er skrevet inn "Ole Henrik Vangen", og alle enkeltnavnene separat. "Ole"+"Henrik"+"Vangen"
- + vurdere om vi skal gjøre som før at alle kombinasjoner av alle navn skal søkes.... Antagelig ikke.
- Skjule mindre interessante resultater - må sikkert diskuteres noen runder med Siv og Ina
*/

function NameSearch(props) {
  console.log(props)
  const [name, setName] = useState({
    error: false,
    errorMessage: 'Bare bokstaver, mellomrom og bindestrek er tillat',
    value: ''
  })
  const [result, setResult] = useState(null)

  function renderResult() {
    return (result && <div>
      <Container className="name-search-result p-5">
        <Row>
          <Col>
            <h3>{props.nameSearchResultTitle}</h3>
            <Divider dark/>
          </Col>
        </Row>
        {
          result.response.docs.filter((doc) => doc.type === 'onlygiven').map((doc, i) =>{
            return (
              <Row key={i}>
                <Col>
                  <p className="result-highlight my-4">
                    {
                      `${props.nameSearchResultText
                        .replace('{0}', doc.count)
                        .replace('{1}', doc.name)} ${translateName(doc.type)}.`
                    }
                  </p>
                </Col>
              </Row>
            )
          })
        }
        <Row>
          <Col>
            <strong>Du synes kanskje også at det er interessant at...</strong>
            <ul className="interesting-facts p-0">
              {
                result.response.docs.map( (doc, i) => {
                  return (
                    <li key={i} className="my-1">
                      Det er {doc.count} som har {doc.name} som sitt {translateName(doc.type)}.
                    </li>
                  )
                })
              }
            </ul>
          </Col>
        </Row>

      </Container>
    </div>
    )
  }

  function translateName(nameCode) {
    const type = {
      firstgivenandfamily: 'eneste fornavn og etternavn',
      middleandfamily: 'mellomnavn/etternavn',
      family: 'etternavn',
      onlygiven: 'eneste fornavn',
      onlygivenandfamily: 'eneste fornavn og etternavn',
      firstgiven: 'første fornavn'
    }
    return type[nameCode]
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
            <h3>{props.nameSearchTitle}</h3>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Input
                className="my-4"
                name="navn"
                label={props.nameSearchInputLabel}
                value={name.value}
                handleChange={handleChange}
                error={name.error}
                errorMessage={name.errorMessage}></Input>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button type="submit">{props.nameSearchButtonText}</Button>
            </Col>
          </Row>
        </Form>
      </Container>
      {renderResult()}
    </section>
  )
}

NameSearch.propTypes = {
  nameSearchTitle: PropTypes.string,
  nameSearchInputLabel: PropTypes.string,
  nameSearchButtonText: PropTypes.string,
  interestingFacts: PropTypes.string,
  nameSearchResultTitle: PropTypes.string,
  nameSearchResultText: PropTypes.string,
  urlToService: PropTypes.string,
  aboutLink: PropTypes.shape({
    title: PropTypes.string,
    url: PropTypes.string
  })
}

export default (props) => <NameSearch {...props} />


