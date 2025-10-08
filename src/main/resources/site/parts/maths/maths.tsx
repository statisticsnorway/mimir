import React from 'react'
import { MathJaxContext, MathJax } from 'better-react-mathjax'

interface MathsProps {
  mathsFormula: string
}

const Maths: React.FC<MathsProps> = ({ mathsFormula }) => {
  const config = {
    loader: {
      load: ['a11y/explorer'], // v3.0
    },
    options: {
      enableMenu: false,
      a11y: {
        speech: true,
      },
      // The mjx-assitive-mml tag is rendered by default for screen readers.
      // We don't need it since the "explorer" accessibility plugin, which adds aria-label for screen readers, is enough.
      renderActions: {
        assistiveMml: [],
      },
    },
  }

  return (
    <MathJaxContext config={config}>
      <MathJax className='text-center'>
        <span tabIndex={0}>{`\\(${mathsFormula}\\)`}</span>
      </MathJax>
    </MathJaxContext>
  )
}

export default Maths
