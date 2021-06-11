import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, TextArea, Title } from '@statisticsnorway/ssb-component-library'

function ContactForm(props) {
  const [receiver, setReceiver] = useState({
    error: false,
    errorMsg: 'Mottaker er ikke valgt',
    value: ''
  })
  const [name, setName] = useState({
    error: false,
    errorMsg: 'Navn er ikke fylt ut',
    value: ''
  })
  const [email, setEmail] = useState({
    error: false,
    errorMsg: 'Epost er ikke fylt ut',
    value: ''
  })
  const [text, setText] = useState({
    error: false,
    errorMsg: 'Tekst er ikke fylt ut',
    value: ''
  })
  const [loading, setLoading] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    if (!isFormValid()) {
      onBlur('receiver')
      onBlur('name')
      onBlur('email')
      onBlur('text')
      return
    }
    console.log('Send mail')
  }

  function isFormValid() {
    return isReceiverValid() && isNameValid() && isEmailValid() && isTextValid()
  }

  function isReceiverValid(value) {
    const receiverValue = value || receiver.value
    const receiverValid = receiverValue !== ''
    if (!receiverValid) {
      setReceiver({
        ...receiver,
        error: true
      })
    }
    return receiverValid
  }

  function isNameValid(value) {
    return value !== ''
  }

  function isEmailValid(value) {
    return value !== ''
  }

  function isTextValid(value) {
    return value !== ''
  }

  function onBlur(id) {
    switch (id) {
    case 'receiver': {
      setReceiver({
        ...receiver,
        error: !isReceiverValid()
      })
      break
    }
    case 'name': {
      setName({
        ...name,
        error: !isNameValid()
      })
      break
    }
    case 'email': {
      setEmail({
        ...email,
        error: !isEmailValid()
      })
      break
    }
    case 'text': {
      setText({
        ...text,
        error: !isTextValid()
      })
      break
    }
    default: {
      break
    }
    }
  }

  function onChange(id, value) {
    switch (id) {
    case 'receiver': {
      setReceiver({
        ...receiver,
        value: value,
        error: receiver.error ? !isReceiverValid(value) : receiver.error
      })
      break
    }
    case 'name': {
      setName({
        ...name,
        value: value,
        error: name.error ? !isNameValid(value) : name.error
      })
      break
    }
    case 'email': {
      setEmail({
        ...email,
        value: value,
        error: name.error ? !isEmailValid(value) : email.error
      })
      break
    }
    case 'text': {
      setText({
        ...text,
        value,
        error: text.error ? !isTextValid(value) : text.error
      })
      break
    }
    default: {
      break
    }
    }
  }


  function renderContactForm() {
    return (
      <div className="contact-form">
        <Row>
          <Col lg="12">
            <Title size={1}>Kontakt oss</Title>
          </Col>
        </Row>
        <Row>
          <Col className="col-12">
            <p className="publish-text">
                Statistisk sentralbyrå ønsker å yte god service til brukerne. Du skal få rask og riktig informasjon når du henvender deg til oss.
            </p>
          </Col>
        </Row>
        <Row>
          <Col className='col-6'>
            <Form onSubmit={onSubmit}>
              <Container>
                <Row>
                  <Col className="input-amount">
                    <Dropdown
                      className="receiver"
                      id='receiver'
                      onSelect={(value) => {
                        onChange('receiver', value)
                      }}
                      placeholder='Hva gjelder henvendelsen'
                      items={[
                        {
                          title: 'Generell henvendelse',
                          id: 'generell'
                        },
                        {
                          title: 'Statistikk og forskning',
                          id: 'statistikk'
                        },
                        {
                          title: 'Spørreundersøkelser og innrapportering',
                          id: 'innrapportering'
                        }]}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="name">
                    <Input
                      className="input-name"
                      label='Skriv inn navn'
                      handleChange={(value) => onChange('name', value)}
                      onBlur={() => onBlur('name')}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="email">
                    <Input
                      className="email"
                      label='Skriv inn e-post'
                      handleChange={(value) => onChange('email', value)}
                      onBlur={() => onBlur('email')}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="text">
                    <TextArea
                      label='Skriv noen ord om hva vi kan hjelpe deg med?'
                    />
                  </Col>
                </Row>
                <Row className="submit">
                  <Col>
                    <Button className="submit-button" primary type="submit" disabled={loading}>Send inn skjema</Button>
                  </Col>
                </Row>
              </Container>
            </Form>
          </Col>
          <Col className='col-6'>
            <p>Her kommer accordions</p>
          </Col>
        </Row>
      </div>
    )
  }

  return (
    renderContactForm()
  )
}

ContactForm.propTypes = {
  emailGeneral: PropTypes.string,
  emailStatistikk: PropTypes.string,
  emailInnrapportering: PropTypes.string
}

export default (props) => <ContactForm {...props} />
