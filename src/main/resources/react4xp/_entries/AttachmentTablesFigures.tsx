import React from 'react'
import { type AttachmentTablesFiguresProps } from '/lib/types/partTypes/attachmentTablesFigures'
import AttachmentTablesFigures from '../attachmentTablesFigures/AttachmentTablesFigures'

const AttachmentTableFigures = (props: AttachmentTablesFiguresProps) => {
  const { title } = props
  return (
    <>
      <h2>{title}</h2>
      <AttachmentTablesFigures {...props} />
    </>
  )
}

export default (props: AttachmentTablesFiguresProps) => <AttachmentTableFigures {...props} />
