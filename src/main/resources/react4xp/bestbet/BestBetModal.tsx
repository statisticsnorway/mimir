import React from 'react'
import { Modal } from 'react-bootstrap'

interface BestBetModalProps {
  show?: unknown;
  onHide?: unknown;
  title?: string;
  body?: React.ReactNode;
  footer?: React.ReactNode;
}

function BestBetModal(props: BestBetModalProps) {
  return (
    <Modal size='lg' show={props.show} onHide={props.onHide}>
      <Modal.Header closeButton>
        <Modal.Title>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{props.body}</Modal.Body>
      <Modal.Footer>{props.footer}</Modal.Footer>
    </Modal>
  )
}

export default BestBetModal
