import React from 'react'
import PropTypes from 'prop-types'
import { Modal } from 'react-bootstrap'

function EditSearchWordsModal(props) {
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
    >
      <Modal.Header closeButton>
        <Modal.Title>Rediger nøkkelord</Modal.Title>
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

EditSearchWordsModal.propTypes = {
  show: PropTypes.boolean,
  onHide: PropTypes.boolean,
  body: PropTypes.node,
  footer: PropTypes.node
}

export default (props) => <EditSearchWordsModal {...props} />
