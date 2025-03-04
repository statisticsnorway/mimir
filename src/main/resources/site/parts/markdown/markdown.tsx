import React from 'react'
import { type MarkdownProps } from '/lib/types/partTypes/markdown'

function Markdown(props: MarkdownProps) {
  function renderMarkdown() {
    const { markdownText } = props

    if (markdownText) {
      return (
        <div className='col-lg-8 p-0'>
          <div
            className='markdown-body'
            dangerouslySetInnerHTML={{
              __html: markdownText,
            }}
          />
        </div>
      )
    }
  }

  return (
    <section className='xp-part markdon container p-0 mb-5'>
      <div className='row'>
        <div className='col-12 offset-lg-1 p-0'>
          <div className='container row p-0'>{renderMarkdown()}</div>
        </div>
      </div>
    </section>
  )
}

export default (props: MarkdownProps) => <Markdown {...props} />
