import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'

function BestBetModal(props) {
  return (
    <Modal
      size="lg"
      show={props.show}
      onHide={props.onHide}
    >
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.body}
      </Modal.Body>
      <Modal.Footer>
        {props.footer}
      </Modal.Footer>
    </Modal>
  )
}

BestBetModal.propTypes = {
  show: PropTypes.boolean,
  onHide: PropTypes.boolean,
  title: PropTypes.string,
  body: PropTypes.node,
  footer: PropTypes.node
}

export default (props) => <BestBetModal {...props} />
