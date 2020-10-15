import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import PropTypes from 'prop-types'

export function RefreshStatisticsForm(props) {
  const {
    onSubmit
  } = props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fetchPublished, setFetchPublished] = useState(false)

  return (
    <Form className="mt-3">
      <Form.Group controlId="formBasicUsername">
        <Form.Label>Brukernavn</Form.Label>
        <Form.Control
          type="username"
          placeholder="Brukernavn"
          disabled
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Passord"
          disabled
          onChange={(e) => setPassword(e.target.value)}
        />
      </Form.Group>
      <Form.Group controlId="formBasicCheckbox">
        <Form.Check
          onChange={(e) => setFetchPublished(e.target.checked)}
          type="checkbox"
          label="Hent publiserte tall"
        />
      </Form.Group>
      <Button
        variant="primary"
        onClick={() => onSubmit({
          username,
          password,
          fetchPublished
        })}
      >
        Send
      </Button>
    </Form>
  )
}

RefreshStatisticsForm.propTypes = {
  onSubmit: PropTypes.func
}
export default (props) => <RefreshStatisticsForm {...props} />
