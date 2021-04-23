import React, { useState } from 'react'
import { Button } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { Col, Container, Row, Form } from 'react-bootstrap'
import axios from 'axios'


function NameSearch(props) {
  const [name, setName] = useState('')
  const [result, setResult] = useState(null)

  function renderResult() {
    return (<div>
      <h3>Noe react kode</h3>
      <div>{
        result && result.response.docs.map( (doc, i) => {
          return (
            <Row key={i}>
              <h3>{doc.name}</h3>
              <span>Antall: {doc.count}</span>
              <span>type: {doc.type}</span>
            </Row>
          )
        })
      }</div>
    </div>
    )
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
      // setResult({message: e})
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


