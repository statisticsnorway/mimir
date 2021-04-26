import React, { useState } from 'react'
import { Button, Divider, Input } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Col, Container, Row, Form } from 'react-bootstrap'
import axios from 'axios'

/* TODO
- Validere inputs på frontend
- Sanitize inputs på backend
- Oversette navnetyper (firstandonlygiven -> første og eneste fornavn, etc)
- Styling og presentasjon
- Tekst for "Det er 0-3 personer som heter... "
- Hente korrekte fraser for ulike situasjoner
- Backend som søker på både kombinasjonen av alle navn som er skrevet inn "Ole Henrik Vangen", og alle enkeltnavnene separat. "Ole"+"Henrik"+"Vangen"
- + vurdere om vi skal gjøre som før at alle kombinasjoner av alle navn skal søkes.... Antagelig ikke.
- Skjule mindre interessante resultater - må sikkert diskuteres noen runder med Siv og Ina
- ?? Vise bilde med historisk utvikling ??
*/

function NameSearch(props) {
  const [name, setName] = useState({
    error: false,
    errorMessage: 'Feil i input',
    value: ''
  })
  const [result, setResult] = useState(null)

  function renderResult() {
    return (result && <div>
      <Container className="name-search-result p-5">
        <Row>
          <Col>
            <h3>Resultat</h3>
            <Divider dark/>
          </Col>
        </Row>
        {
          result.response.docs.filter((doc) => doc.type === 'onlygiven').map((doc, i) =>{
            return (
              <Row key={i}>
                <Col>
                  <p className="result-highlight my-4">
                    Det er <strong>{doc.count}</strong> som har <strong>{doc.name}</strong> som sitt {translateName(doc.type)}.
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
    console.log(form)

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
      ...name,
      value: event.value
    })
  }

  return (
    <section className="name-search container-fluid">
      <Container className="name-search-input p-5">
        <Row>
          <Col>
            <h3>Navnesøk</h3>
          </Col>
        </Row>
        <Form onSubmit={handleSubmit}>
          <Row>
            <Col>
              <Input
                className="my-4"
                name="navn"
                label="Sett inn navn"
                value={name.value}
                handleChange={handleChange}
                error={name.error}
                errorMessage={name.errorMsg}></Input>
            </Col>
          </Row>
          <Row>
            <Col>
              <Button type="submit">Se resultatet</Button>
            </Col>
          </Row>
        </Form>
      </Container>
      {renderResult()}
    </section>
  )
}

NameSearch.propTypes = {
  urlToService: PropTypes.string
}

export default (props) => <NameSearch {...props} />


