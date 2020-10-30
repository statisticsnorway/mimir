import React, { useState } from 'react'
import { Form, Button } from 'react-bootstrap'
import PropTypes from 'prop-types'

export function RefreshStatisticsForm(props) {
  const {
    onSubmit,
    owner,
    sources
  } = props
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [fetchPublished, setFetchPublished] = useState(false)

  return (
    <Form className="mt-3">
      <p>Autorisasjon for {owner}. <br/>Tabeller: {sources.map( (source) => source.tableId).join(', ')}.</p>
      <Form.Group controlId="formBasicUsername">
        <Form.Label>Brukernavn</Form.Label>
        <Form.Control
          type="username"
          placeholder="Brukernavn"
          onChange={(e) => setUsername(e.target.value)}
        />
      </Form.Group>

      <Form.Group controlId="formBasicPassword">
        <Form.Label>Password</Form.Label>
        <Form.Control
          type="password"
          placeholder="Passord"
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
          owner,
          fetchPublished
        })}
      >
        Send
      </Button>
    </Form>
  )
}

RefreshStatisticsForm.propTypes = {
  onSubmit: PropTypes.func,
  owner: PropTypes.string,
  sources: PropTypes.arrayOf(
    PropTypes.shape({
      tableId: PropTypes.number | PropTypes.string
    })
  )
}

export default (props) => <RefreshStatisticsForm {...props} />
