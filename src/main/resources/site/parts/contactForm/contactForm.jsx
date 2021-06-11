import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, TextArea } from '@statisticsnorway/ssb-component-library'

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
    const receiverValid = !!(value || receiver.value)
    if (!receiverValid) {
      setReceiver({
        ...receiver,
        error: true
      })
    }
    return receiverValid
  }

  function isNameValid(value) {
    return !!(value || name.value)
  }

  function isEmailValid(value) {
    return !!(value || email.value)
  }

  function isTextValid(value) {
    return !!(value || text.value)
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
    console.log(id, value)
    switch (id) {
    case 'receiver': {
      setReceiver({
        ...receiver,
        value: value,
        error: receiver.error ? !isReceiverValid(value) : false
      })
      break
    }
    case 'name': {
      setName({
        ...name,
        value: value,
        error: name.error ? !isNameValid(value) : false
      })
      break
    }
    case 'email': {
      setEmail({
        ...email,
        value: value,
        error: email.error ? !isEmailValid(value) : false
      })
      break
    }
    case 'text': {
      setText({
        ...text,
        value,
        error: text.error ? !isTextValid(value) : false
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
      <section className="xp-part part-contact-form container">
        <Row>
          <Col>
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
                      error={receiver.error}
                      errorMessage={receiver.errorMsg}
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
                      error={name.error}
                      errorMessage={name.errorMsg}
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
                      error={email.error}
                      errorMessage={email.errorMsg}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className="text">
                    <TextArea
                      rows="7"
                      label='Skriv noen ord om hva vi kan hjelpe deg med?'
                      error={text.error}
                      errorMessage={text.errorMsg}
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
        </Row>
      </section>
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
