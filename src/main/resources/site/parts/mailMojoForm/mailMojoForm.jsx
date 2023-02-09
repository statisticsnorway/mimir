import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Text, Input, Button } from '@statisticsnorway/ssb-component-library'

function MailmojoForm(props) {
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
    <section className='xp-part mailmojo-form'>
      <Text>{props.ingress}</Text>
      <form method='post' action={props.mailMojoFormUrl}>
        <Input
          type='email'
          label={props.emailLabel}
          name='email'
          id='mm-email'
          className='my-4'
          handleChange={(value) => validateEmail(value)}
          error={email.error}
          errorMessage={email.errorMsg}
        />
        <input type='hidden' name='email' value={email.value} />
        <Button type='submit' name='submit' disabled={email.error} primary>
          {props.buttonTitle}
        </Button>
      </form>
    </section>
  )
}

MailmojoForm.propTypes = {
  mailMojoFormUrl: PropTypes.string,
  ingress: PropTypes.string,
  emailLabel: PropTypes.string,
  validateEmailMsg: PropTypes.string,
  buttonTitle: PropTypes.string,
}

export default (props) => <MailmojoForm {...props} />
