import React from 'react'
import { MathJaxContext, MathJax } from 'better-react-mathjax'

interface MathsProps {
  mathsFormula: string
}

const Maths: React.FC<MathsProps> = ({ mathsFormula }) => {
  const config = {
    loader: {
      load: ['a11y/sre', 'a11y/semantic-enrich'], // v3.0
    },
    options: {
      enableMenu: false,
      a11y: {
        speech: true,
        assistiveMml: true,
      },
    },
  }

  return (
    <MathJaxContext config={config}>
      <MathJax tabIndex={0} className='text-center'>{`\\(${mathsFormula}\\)`}</MathJax>
    </MathJaxContext>
  )
}

export default Maths
