import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, Input } from '@statisticsnorway/ssb-component-library'

function MailchimpForm(props) {
  const [email, setEmail] = useState({
    error: false,
    errorMsg: props.validateEmail
  })

  function submit(e) {
    console.log(e)
  }

  function validateEmail(value) {
    const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    const result = value.match(regEx)
    setEmail({
      ...email,
      error: !result
    })
  }

  return (
    <form method="post" action={props.endpoint}>
      <Input type="email"
        name="EMAIL"
        className="my-4"
        handleChange={(value) => validateEmail(value)}
        error={email.error}
        errorMessage={email.errorMsg}/>
      <input type="text" name={props.id} value="" hidden/>
      <Button onClick={submit}>Registrer deg</Button>
    </form>
  )
}

MailchimpForm.PropTypes = {
  endpoint: PropTypes.string,
  id: PropTypes.string,
  validateEmail: PropTypes.string
}

export default (props) => <MailchimpForm {...props}/>

