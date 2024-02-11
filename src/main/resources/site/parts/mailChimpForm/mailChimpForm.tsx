import React, { useState } from 'react'
import { Button, Input, Paragraph } from '@statisticsnorway/ssb-component-library'

interface MailchimpFormProps {
  text?: string;
  emailLabel?: string;
  buttonTitle?: string;
  endpoint?: string;
  id?: string;
  validateEmailMsg?: string;
}

function MailchimpForm(props: MailchimpFormProps) {
  const [email, setEmail] = useState({
    error: false,
    errorMsg: props.validateEmailMsg,
    value: '',
  })

  function validateEmail(value) {
    const regEx = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i
    const result = value.match(regEx)
    setEmail({
      ...email,
      value,
      error: !result,
    })
  }

  const mailMojoForm = props.endpoint && !props.id
  return (
    <section className='xp-part mailchimp-form'>
      {props.text && <Paragraph>{props.text}</Paragraph>}
      <form method='post' action={props.endpoint}>
        <Input
          type='email'
          label={props.emailLabel}
          name={mailMojoForm ? 'email' : 'EMAIL'}
          id={mailMojoForm ? 'mm-email' : 'mce-EMAIL'}
          className='my-4'
          handleChange={(value) => validateEmail(value)}
          error={email.error}
          errorMessage={email.errorMsg}
        />
        {props.id && <input type='hidden' name={props.id} value='' />}
        <input type='hidden' name={mailMojoForm ? 'email' : 'EMAIL'} value={email.value} />
        <Button disabled={email.error} type='submit' primary>
          {props.buttonTitle}
        </Button>
      </form>
    </section>
  )
}

export default (props) => <MailchimpForm {...props} />
