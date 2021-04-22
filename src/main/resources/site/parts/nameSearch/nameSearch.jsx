import React, { useState } from 'react'
import { Button, Link } from '@statisticsnorway/ssb-component-library'
import PropTypes from 'prop-types'
import { ArrowRight } from 'react-feather'
import Truncate from 'react-truncate'
import { Col, Container, Row } from 'react-bootstrap'
import axios from 'axios'


function NameSearch(props) {
  const [name, setName] = useState('')
  const [result, setResult] = useState([])


  function renderResult() {
    return (<>
      <div>Noe react kode</div>
      <pre>{result}</pre>
    </>
    )
  }

  function submitForm(form) {
    console.log(JSON.stringify(form, null, 2))
    axios.get(
      props.urlToService, {
        params: {
          name: form.navn
        }
      }
    ).then((res) =>{
      setResult(res.data)
    }
    )
  }
  return (
    <section className="article-list container-fluid">
      <h3>Navnesøk</h3>
      <form onSubmit={submitForm}>
        <Container>
          <Row>
            <Col>
              <input name="navn"></input>
            </Col>
            <Button type="submit">Søk</Button>
          </Row>
        </Container>
      </form>
      {renderResult}
    </section>
  )
}

NameSearch.propTypes = {
  urlToService: PropTypes.string
}

export default (props) => <NameSearch {...props} />


