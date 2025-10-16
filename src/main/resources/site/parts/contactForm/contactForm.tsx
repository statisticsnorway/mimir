import React, { useEffect, useState } from 'react'
import { Form, Container, Row, Col } from 'react-bootstrap'
import { Divider, Title, FormError } from '@statisticsnorway/ssb-component-library'
import axios from 'axios'
import { Button, Label, Textfield, Select, Field } from '@digdir/designsystemet-react'
import { type Phrases } from '/lib/types/language'

interface ContactFormProps {
  recaptchaSiteKey?: string
  contactFormServiceUrl: string
  phrases: Phrases
  language?: string
}

function ContactForm(props: ContactFormProps) {
  const { contactFormServiceUrl, recaptchaSiteKey } = props
  const defaultReceiverItem = {
    title: props.phrases.contactFormReceiverGenerell,
    id: 'generell',
  }
  const [receiver, setReceiver] = useState({
    error: false,
    errorMsg: props.phrases.contactFormValidateReveicer,
    value: defaultReceiverItem,
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

  useEffect(() => {
    // Remove false positive from Wave
    const captcha = document.querySelector("[name='g-recaptcha-response']")
    if (captcha) {
      captcha.setAttribute('aria-hidden', 'true')
      captcha.setAttribute('aria-readonly', 'true')
      captcha.setAttribute('aria-label', 'recaptcha')
    }
  }, [])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isFormValid()) {
      onBlur('receiver')
      onBlur('name')
      onBlur('email')
      onBlur('text')
      return
    }
    setLoading(true)
    grecaptcha.enterprise.ready(function () {
      grecaptcha.enterprise
        .execute(recaptchaSiteKey as string, {
          action: 'submitContactForm',
        })
        .then(function (token: string) {
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
    })
  }

  function isFormValid() {
    return isReceiverValid() && isNameValid() && isEmailValid() && isTextValid()
  }

  function isReceiverValid(value?: string) {
    const receiverValid = !!(value || receiver.value)
    if (!receiverValid) {
      setReceiver({
        ...receiver,
        error: true,
      })
    }
    return receiverValid
  }

  function isNameValid(value?: string) {
    return !!(value || name.value)
  }

  function isEmailValid(value?: string) {
    const regEx =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const emailVal = value || email.value
    const testEmail = emailVal.match(regEx)
    return !!testEmail
  }

  function isTextValid(value?: string) {
    const textValue = value || text.value
    return !!(textValue && textValue.length > 10)
  }

  function onBlur(id: string) {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onChange(id: string, value: any) {
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
              <Title size={2} className='h3'>
                {props.phrases.contactFormMessageSentOk}
              </Title>
              <p>{props.phrases.contactFormMessageSentText}</p>
            </Container>
          </Col>
        </Row>
      )
    }
    return
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
    return
  }

  function renderForm() {
    if (!emailSent) {
      const items = [
        defaultReceiverItem,
        {
          title: props.phrases.contactFormReceiverStatistikk,
          id: 'statistikk',
        },
        {
          title: props.phrases.contactFormReceiverInnrapportering,
          id: 'innrapportering',
        },
      ]

      return (
        <Row>
          <Col>
            <Divider light />
            <Container className='pt-3'>
              <Title size={2} className='h3'>
                {props.phrases.contactFormTitle}
              </Title>
              <p>{props.phrases.contactFormText}</p>
            </Container>
            <Form onSubmit={onSubmit}>
              <Container>
                <Row>
                  <Col className='input-amount py-2'>
                    <Field>
                      <Label htmlFor='receiver'>{props.phrases.contactFormChooseReceiver}</Label>
                      <Select id='receiver'>
                        {items.map((item) => (
                          <Select.Option key={item.id} value={item.id}>
                            {item.title}
                          </Select.Option>
                        ))}
                      </Select>
                    </Field>
                  </Col>
                </Row>
                <Row>
                  <Col className='name py-2'>
                    <Textfield
                      className='input-name'
                      label={props.phrases.contactFormLabelName}
                      onChange={(event) => onChange('name', event.target.value)}
                      onBlur={() => onBlur('name')}
                      error={name.error ? name.errorMsg : undefined}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='email py-2'>
                    <Textfield
                      className='email'
                      type='email'
                      label={props.phrases.contactFormLabelEmail}
                      onChange={(event) => onChange('email', event.target.value)}
                      onBlur={() => onBlur('email')}
                      error={email.error ? email.errorMsg : undefined}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col className='text py-2'>
                    <Textfield
                      label={props.phrases.contactFormLabelText}
                      multiline
                      onChange={(event) => onChange('text', event.target.value)}
                      onBlur={() => onBlur('text')}
                      error={text.error ? text.errorMsg : undefined}
                    />
                  </Col>
                </Row>
                <Row className='submit pt-2 pb-4'>
                  <Col>
                    <Button variant='primary' loading={loading} type='submit'>
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
    return
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

export default (props: ContactFormProps) => <ContactForm {...props} />
