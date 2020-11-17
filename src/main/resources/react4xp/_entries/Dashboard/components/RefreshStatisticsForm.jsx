import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import PropTypes from 'prop-types'

export function RefreshStatisticsForm(props) {
  const {
    onSubmit,
    modalInfo
  } = props

  const [owners, setOwners] = useState({})
  const [fetchPublished, setFetchedPublished] = useState(null)

  function updateOwnerCredentials(ownerKey, propKey, value, ownerTableIds, tbmlId) {
    if (!!owners[ownerKey]) {
      owners[ownerKey][propKey] = value
      owners[ownerKey].ownerTableIds = ownerTableIds,
      tbmlId
    } else {
      owners[ownerKey] = {
        [propKey]: value,
        ownerTableIds: ownerTableIds,
        tbmlId
      }
    }
    setOwners(owners)
  }

  function renderOwnerInputField(owner, sources, i, tbmlId) {
    const ownerTableIds = sources.map((source) => source.id)
    return (
      <div key={i}>
        <p>Autorisasjon for TBML {tbmlId} med eier {owner}. <br/>TabelId: {
          sources
            .map( (source) => source.tableId)
            .filter((value, index, self) => self.indexOf(value) === index) // only unique values
            .join(', ')
        }.
        </p>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Brukernavn</Form.Label>
          <Form.Control
            type="username"
            placeholder="Brukernavn"
            onChange={(e) => updateOwnerCredentials(owner, 'username', e.target.value, ownerTableIds, tbmlId)}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Passord"
            onChange={(e) => updateOwnerCredentials(owner, 'password', e.target.value, ownerTableIds, tbmlId)}
          />
        </Form.Group>
      </div>
    )
  }

  return (
    <Form className="mt-3">
      {
        modalInfo.relatedTables.map((table) => {
          return table.sourceList && Object.keys(table.sourceList).map((key, i) => {
            return renderOwnerInputField(key, table.sourceList[key], i, table.tbmlId)
          })
        })
      }
      <Form.Group controlId="formBasicCheckbox">
        <Form.Check
          onChange={(e) => setFetchedPublished(e.target.value)}
          type="checkbox"
          label="Hent publiserte tall"
        />
      </Form.Group>
      <Button
        variant="primary"
        onClick={() => onSubmit({
          owners,
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
  ),
  modalInfo: PropTypes.shape({
    relatedTables: PropTypes.arrayOf(
      PropTypes.shape({
        owner: PropTypes.number,
        tableApproved: PropTypes.string,
        tableId: PropTypes.number,
        id: PropTypes.string,
        table: PropTypes.string
      })
    )
  })
}

export default (props) => <RefreshStatisticsForm {...props} />
