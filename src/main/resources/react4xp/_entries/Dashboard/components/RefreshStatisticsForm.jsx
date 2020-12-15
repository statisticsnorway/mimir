import React, { useState } from 'react'
import { Button, Form } from 'react-bootstrap'
import PropTypes from 'prop-types'

export function RefreshStatisticsForm(props) {
  const {
    onSubmit,
    modalInfo
  } = props

  const [owners, setOwners] = useState([])
  const [fetchPublished, setFetchedPublished] = useState(null)

  function updateOwnerCredentials(ownersObj, propKey, value) {
    const currentOwner = owners.find((owner) => owner.ownerId === ownersObj.ownerId)
    if (currentOwner) {
      currentOwner[propKey] = value
    } else {
      owners.push({
        ...ownersObj,
        [propKey]: value
      })
    }
    setOwners(owners)
  }
  function renderOwnerInputForMultipleTbml(owner, index) {
    return (
      <div key={index}>
        <p>Autorisasjon for bruker {owner.ownerId} som har</p>
        <ul> {
          owner.tbmlIdList.map((tbml, i) => {
            return (<li key={i}>
              TBML {owner.tbmlId} og TableId {tbml.tableId} med kilder: {tbml.sourceTableIds.join(', ')}.
            </li>)
          })
        } </ul>
        <Form.Group controlId="formBasicUsername">
          <Form.Label>Brukernavn</Form.Label>
          <Form.Control
            required
            type="username"
            placeholder="Brukernavn"
            onChange={(e) => updateOwnerCredentials(owner, 'username', e.target.value )}
          />
        </Form.Group>
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            required
            type="password"
            placeholder="Passord"
            onChange={(e) => updateOwnerCredentials(owner, 'password', e.target.value )}
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
        tbmlId: PropTypes.number,
        tbmlIdList: PropTypes.arrayOf(
          PropTypes.shape({
            tbmlId: PropTypes.string,
            sourceTableIds: PropTypes.arrayOf(PropTypes.string)
          })
        )
      })
    )
  })
}

export default (props) => <RefreshStatisticsForm {...props} />
