import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Input } from '@statisticsnorway/ssb-component-library'

function MailchimpForm(props) {
  const [email, setEmail] = useState({
    error: false,
    errorMsg: props.validateEmailMsg,
    value: '',
  })

  function validateEmail(value) {
    // eslint-disable-next-line max-len
    const regEx =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const result = value.match(regEx)
    setEmail({
      ...email,
      value,
      error: !result,
    })
  }

  return (
    <form method='post' action={props.endpoint}>
      <Input
        type='email'
        label={props.emailLabel}
        name='EMAIL'
        id='mce-EMAIL'
        value=''
        className='my-4'
        handleChange={(value) => validateEmail(value)}
        error={email.error}
        errorMessage={email.errorMsg}
      />
      <input type='hidden' name={props.id} value='' />
      <input type='hidden' name='EMAIL' value={email.value} />
      <Button disabled={email.error} type='submit' primary>
        {props.buttonTitle}
      </Button>
    </form>
  )
}

MailchimpForm.propTypes = {
  emailLabel: PropTypes.string,
  buttonTitle: PropTypes.string,
  endpoint: PropTypes.string,
  id: PropTypes.string,
  validateEmailMsg: PropTypes.string,
}

export default (props) => <MailchimpForm {...props} />
