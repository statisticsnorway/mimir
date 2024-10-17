import React from 'react'
import { type AttachmentTablesFiguresProps } from '/lib/types/partTypes/attachmentTablesFigures'
import AttachmentTablesFigures from '../attachmentTablesFigures/AttachmentTablesFigures'

const AttachmentTableFigures = (props: AttachmentTablesFiguresProps) => {
  const { title } = props
  return (
    <div>
      <h2>{title}</h2>
      <AttachmentTablesFigures {...props} />
    </div>
  )
}

export default (props: AttachmentTablesFiguresProps) => <AttachmentTableFigures {...props} />
