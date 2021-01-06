import React, { useState } from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
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
      <div key={index} className='border border-dark rounded p-2 mb-3'>
        <p>Autorisasjon for bruker {owner.ownerId} som har</p>
        <ul> {
          owner.tbmlList.map((tbml, i) => {
            return (<li key={i}>
              TBML {tbml.tbmlId} med kilder: {tbml.statbankTableIds.filter((value, index, self) => self.indexOf(value) === index) // only unique values
                .join(', ')}.
            </li>)
          })
        } </ul>
        <Row>
          <Col>
            <Form.Group controlId={'formBasicUsername_' + index}>
              <Form.Label>Brukernavn</Form.Label>
              <Form.Control
                required
                type="username"
                placeholder="Brukernavn"
                onChange={(e) => updateOwnerCredentials(owner, 'username', e.target.value )}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={'formBasicPassword_' + index}>
              <Form.Label>Password</Form.Label>
              <Form.Control
                required
                type="password"
                placeholder="Passord"
                onChange={(e) => updateOwnerCredentials(owner, 'password', e.target.value )}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group controlId={'formBasicCheckbox_' + index}>
              <Form.Check
                onChange={(e) => updateOwnerCredentials(owner, 'fetchPublished', e.target.value )}
                type="checkbox"
                label="Hent publiserte tall"
              />
            </Form.Group>
          </Col>
        </Row>
      </div>
    )
  }

  return (
    <Form className="mt-3">
      {
        modalInfo.relatedUserTBMLs.map((owner, index) => {
          return renderOwnerInputForMultipleTbml(owner, index)
        })

      }
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
    relatedUserTBMLs: PropTypes.arrayOf(
      PropTypes.shape({
        ownerId: PropTypes.number,
        tbmlList: PropTypes.arrayOf(
          PropTypes.shape({
            tbmlId: PropTypes.number,
            sourceTableIds: PropTypes.arrayOf(PropTypes.string),
            statbankTableIds: PropTypes.arrayOf(PropTypes.string)
          })
        )
      })
    )
  })
}

export default (props) => <RefreshStatisticsForm {...props} />
