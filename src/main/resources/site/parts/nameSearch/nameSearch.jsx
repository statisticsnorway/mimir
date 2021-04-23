import React, { useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'
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
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)

  function renderResult() {
    return (result && <div>
      <Container className="nameSearch-result">
        <Row>
          <h3>Resultat</h3>
        </Row>
        <Row>
          {
            result.response.docs.map( (doc, i) => {
              return (
                <Row key={i}>
                  <span>Det er {doc.count} som har {doc.name} som sitt {translateName(doc.type)}.</span>
                </Row>
              )
            })
          }
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
          name: name
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
    setName(event.target.value)
  }

  return (
    <section className="article-list container-fluid">
      <h3>Navnesøk</h3>
      <Form onSubmit={handleSubmit}>
        <Container>
          <Row>
            <Col>
              <input name="navn" value={name} onChange={handleChange}></input>
            </Col>
            <Button type="submit">Søk</Button>
          </Row>
        </Container>
      </Form>
      {renderResult()}
    </section>
  )
}

NameSearch.propTypes = {
  urlToService: PropTypes.string
}

export default (props) => <NameSearch {...props} />


