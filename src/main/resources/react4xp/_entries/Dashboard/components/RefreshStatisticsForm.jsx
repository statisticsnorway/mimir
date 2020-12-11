import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { func } from 'prop-types'
import { User } from 'react-feather'

export function RefreshStatisticsForm(props) {
  const {
    onSubmit,
    modalInfo
  } = props

  const [owners, setOwners] = useState({})
  const [fetchPublished, setFetchedPublished] = useState(null)

  /*
[ {owner: 312, username: "asd", password: "qwe", [ {tbmlId: 555, sources: ["ID 333", "ID 444"...] } ], ...]
tbml id 123 url: tbprocessor/docuemnt/123
<process>
  <source ID="">
</proces>
*/

  function updateOwnerCredentials(ownersObj, propKey, value, ownerId) {
    if (!!ownersObj[ownerKey]) {
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
  function renderOwnerInputForMultipleTbml(owner, index) {
    return (
      <div key={index}>
        <p>Autorisasjon for bruker {owner.ownerId} som har <ul> {
          owner.tbmlIdList.map((tbml, i) => {
            return (<li key={i}>
              TBML {tbml.tbmlId} med kilder: {tbml.sourceTableId.join(', ')}.
            </li>)
          })
        } </ul>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Brukernavn</Form.Label>
          <Form.Control
            type="username"
            placeholder="Brukernavn"
            onChange={(e) => updateOwnerCredentials(owner, 'username', e.target.value, owner.ownerId )}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Passord"
            onChange={(e) => updateOwnerCredentials(owner, 'password', e.target.value, owner.ownerId )}
          />
        </Form.Group></p>
      </div>
    )
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
        // modalInfo.relatedTables.map((table) => {
        //   return table.sourceList && Object.keys(table.sourceList).map((key, i) => {
        //     return renderOwnerInputField(key, table.sourceList[key], i, table.tbmlId)
        //   })
        // })
        modalInfo.relatedUserTBMLs.map((owner, index) => {
          return renderOwnerInputForMultipleTbml(owner, index)
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
    ),
    relatedUserTBMLs: PropTypes.arrayOf(
      PropTypes.shape({
        ownerId: PropTypes.number,
        tbmlIdList: PropTypes.arrayOf(
          PropTypes.shape({
            tbmlId: PropTypes.string,
            sourceTableId: PropTypes.arrayOf(PropTypes.string)
          })
        )
      })
    )
  })
}

export default (props) => <RefreshStatisticsForm {...props} />
