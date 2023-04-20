import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Input, Button, Dropdown, TextArea, Divider, Title, FormError } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'

function ContactForm(props) {
  const { contactFormServiceUrl, recaptchaSiteKey } = props
  const [receiver, setReceiver] = useState({
    error: false,
    errorMsg: props.phrases.contactFormValidateReveicer,
    value: '',
  })
  const [name, setName] = useState({
    error: false,
    errorMsg: props.phrases.contactFormValidateName,
    value: '',
  })
  const [email, setEmail] = useState({
    error: false,
    errorMsg: props.phrases.contactFormValidateEmail,
    value: '',
  })
  const [text, setText] = useState({
    error: false,
    errorMsg: props.phrases.contactFormValidateText,
    value: '',
  })
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailSentFailed, setEmailSentFailed] = useState(false)

  function onSubmit(e) {
    e.preventDefault()
    if (!isFormValid()) {
      onBlur('receiver')
      onBlur('name')
      onBlur('email')
      onBlur('text')
      return
    }
    setLoading(true)
    grecaptcha.ready(function () {
      grecaptcha
        .execute(recaptchaSiteKey, {
          action: 'submitContactForm',
        })
        .then(function (token) {
          axios
            .post(contactFormServiceUrl, {
              receiver: receiver.value,
              name: name.value,
              email: email.value,
              text: text.value,
              language: props.language === 'en' ? 'en' : 'no',
              token,
            })
            .then(() => {
              setEmailSent(true)
            })
            .catch((err) => {
              setEmailSentFailed(true)
              console.trace(err)
            })
            .finally(() => {
              setLoading(false)
            })
        })
        .catch((e) => {
          console.trace(e)
        })
    })
  }

  function isFormValid() {
    return isReceiverValid() && isNameValid() && isEmailValid() && isTextValid()
  }

  function isReceiverValid(value) {
    const receiverValid = !!(value || receiver.value)
    if (!receiverValid) {
      setReceiver({
        ...receiver,
        error: true,
      })
    }
    return receiverValid
  }

  function isNameValid(value) {
    return !!(value || name.value)
  }

  function isEmailValid(value) {
    // eslint-disable-next-line max-len
    const regEx =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const emailVal = value || email.value
    const testEmail = emailVal.match(regEx)
    return !!testEmail
  }

  function isTextValid(value) {
    const textValue = value || text.value
    return !!(textValue && textValue.length > 10)
  }

  function onBlur(id) {
    switch (id) {
      case 'receiver': {
        setReceiver({
          ...receiver,
          error: !isReceiverValid(),
        })
        break
      }
      case 'name': {
        setName({
          ...name,
          error: !isNameValid(),
        })
        break
      }
      case 'email': {
        setEmail({
          ...email,
          error: !isEmailValid(),
        })
        break
      }
      case 'text': {
        setText({
          ...text,
          error: !isTextValid(),
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
          error: receiver.error ? !isReceiverValid(value) : false,
        })
        break
      }
      case 'name': {
        setName({
          ...name,
          value: value,
          error: name.error ? !isNameValid(value) : false,
        })
        break
      }
      case 'email': {
        setEmail({
          ...email,
          value: value,
          error: email.error ? !isEmailValid(value) : false,
        })
        break
      }
      case 'text': {
        setText({
          ...text,
          value,
          error: text.error ? !isTextValid(value) : false,
        })
        break
      }
      default: {
        break
      }
    }
  }

  function renderEmailSent() {
    if (emailSent) {
      return (
        <Row>
          <Col>
            <Divider light />
            <Container className='pt-3'>
              <Title size={3}>{props.phrases.contactFormMessageSentOk}</Title>
              <p>{props.phrases.contactFormMessageSentText}</p>
            </Container>
          </Col>
        </Row>
      )
    }
  }

  function renderEmailSentError() {
    if (emailSentFailed) {
      return (
        <Row>
          <Col>
            <Container className='py-3'>
              <FormError title={props.phrases.contactFormMessageSentError} errorMessages={[]}></FormError>
            </Container>
          </Col>
        </Row>
      )
    }
  }

  function renderForm() {
    if (!emailSent) {
      return (
        <Row>
          <Col>
            <Divider light />
            <Container className='pt-3'>
              <Title size={3}>{props.phrases.contactFormTitle}</Title>
              <p>{props.phrases.contactFormText}</p>
            </Container>
            <Form onSubmit={onSubmit}>
              <Container>
                <Row>
                  <Col className='input-amount py-2'>
                    <Dropdown
                      className='receiver'
                      id='receiver'
                      onSelect={(value) => {
                        onChange('receiver', value)
                      }}
                      placeholder={props.phrases.contactFormChooseReceiver}
                      error={receiver.error}
                      errorMessage={receiver.errorMsg}
                      items={[
                        {
                          title: props.phrases.contactFormReceiverGenerell,
                          id: 'generell',
                        },
                        {
                          title: props.phrases.contactFormReceiverStatistikk,
                          id: 'statistikk',
                        },
                        {
                          title: props.phrases.contactFormReceiverInnrapportering,
                          id: 'innrapportering',
                        },
                      ]}
                      ariaLabel={props.phrases.contactFormChooseReceiver}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='name py-2'>
                    <Input
                      className='input-name'
                      label={props.phrases.contactFormLabelName}
                      handleChange={(value) => onChange('name', value)}
                      onBlur={() => onBlur('name')}
                      error={name.error}
                      errorMessage={name.errorMsg}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='email py-2'>
                    <Input
                      className='email'
                      label={props.phrases.contactFormLabelEmail}
                      handleChange={(value) => onChange('email', value)}
                      onBlur={() => onBlur('email')}
                      error={email.error}
                      errorMessage={email.errorMsg}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='text py-2'>
                    <TextArea
                      rows={7}
                      handleChange={(value) => onChange('text', value)}
                      onBlur={() => onBlur('text')}
                      label={props.phrases.contactFormLabelText}
                      error={text.error}
                      errorMessage={text.errorMsg}
                    />
                  </Col>
                </Row>
                <Row className='submit pt-2 pb-4'>
                  <Col>
                    <Button className='submit-button' primary type='submit' disabled={loading}>
                      {props.phrases.contactFormSubmitText}
                    </Button>
                  </Col>
                </Row>
              </Container>
            </Form>
          </Col>
        </Row>
      )
    }
  }

  function renderContactForm() {
    return (
      <section className='xp-part part-contact-form container'>
        {renderForm()}
        {renderEmailSent()}
        {renderEmailSentError()}
      </section>
    )
  }

  return renderContactForm()
}

ContactForm.propTypes = {
  recaptchaSiteKey: PropTypes.string,
  contactFormServiceUrl: PropTypes.string,
  phrases: PropTypes.object,
  language: PropTypes.string,
}

export default (props) => <ContactForm {...props} />
