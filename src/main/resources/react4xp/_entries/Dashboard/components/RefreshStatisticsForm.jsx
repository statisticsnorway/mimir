import React, { useState } from 'react'
import { Button, Form, Row, Col } from 'react-bootstrap'
import PropTypes from 'prop-types'
import { selectInternalStatbankUrl } from '../containers/HomePage/selectors'
import { useSelector } from 'react-redux'
import { Link } from '@statisticsnorway/ssb-component-library'


export function RefreshStatisticsForm(props) {
  const {
    onSubmit,
    modalInfo
  } = props

  const [owners, setOwners] = useState([])
  const [validated, setValidated] = useState(false)
  const [fetchPublished, setFetchPublished] = useState(modalInfo.relatedUserTBMLs
    .reduce( (acc, o) => {
      acc[o.ownerId] = false
      return acc
    }, {}))

  const internalStatbankUrl = useSelector(selectInternalStatbankUrl)

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

  function updateFetchPublished(ownerObj, event) {
    event.persist()
    const newStatus = event.target ? event.target.checked : false
    setFetchPublished((prev) => ({
      ...prev,
      [ownerObj.ownerId]: newStatus
    }))
    updateOwnerCredentials(ownerObj, 'fetchPublished', newStatus)
  }

  function processForm(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.checkValidity() !== false) {
      onSubmit(owners)
    }
  }

  function renderOwnerInputForMultipleTbml(owner, index) {
    return (
      <div key={index} className='border border-dark rounded p-2 mb-3'>
        <p>Autorisasjon for bruker {owner.ownerId} som har</p>
        <Row>
          <Col>
            <Form.Group controlId={'formBasicUsername_' + index}>
              <Form.Label>Brukernavn</Form.Label>
              <Form.Control
                role="username"
                required={fetchPublished[owner.ownerId] ? '' : 'required'}
                disabled={fetchPublished[owner.ownerId] ? 'disabled' : ''}
                type="username"
                placeholder="Brukernavn"
                onChange={(e) => updateOwnerCredentials(owner, 'username', e.target.value )}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId={'formBasicPassword_' + index}>
              <Form.Label>Passord</Form.Label>
              <Form.Control
                role="password"
                required={fetchPublished[owner.ownerId] ? '' : 'required'}
                disabled={fetchPublished[owner.ownerId] ? 'disabled' : ''}
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
                onChange={(e) => updateFetchPublished(owner, e )}
                type="checkbox"
                label="Hent publiserte tall"
              />
            </Form.Group>
          </Col>
        </Row>
        <div> {
          owner.tbmlList.map((tbml, i) => {
            return (<div key={i} className='d-inline pr-1 small'>
              TBML {tbml.tbmlId} med kilder: {tbml.statbankTableIds.filter((value, index, self) => self.indexOf(value) === index) // filter: unike verdier
                .map((statbankTableId, i) => {
                  return (<span
                    key={i}
                    className='pr-1'>
                    <Link className='tbmlModalLink' isExternal href={internalStatbankUrl + 'search/?searchquery=' + statbankTableId}>
                      {statbankTableId}
                    </Link>
                  </span>)
                })
              }.
            </div>)
          })
        } </div>
      </div>
    )
  }

  return (
    <Form className="mt-3" validated={validated} onSubmit={processForm}>
      {
        modalInfo.relatedUserTBMLs.map((owner, index) => {
          return renderOwnerInputForMultipleTbml(owner, index)
        })
      }
      <Button
        type="submit"
        variant="primary"
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
