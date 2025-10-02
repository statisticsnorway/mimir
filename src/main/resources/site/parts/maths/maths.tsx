import React from 'react'
import { MathJaxContext, MathJax } from 'better-react-mathjax'

interface MathsProps {
  mathsFormula: string
}

const Maths: React.FC<MathsProps> = ({ mathsFormula }) => {
  const config = {
    loader: {
      load: ['output/svg'], // v.3.0
    },
    options: {
      renderActions: {
        addMenu: [0, '', ''], // Disable context menu
      },
    },
  }

  return (
    <MathJaxContext config={config}>
      <MathJax>
        <span className='d-flex justify-content-center'>{`\\(${mathsFormula}\\)`}</span>
      </MathJax>
    </MathJaxContext>
  )
}

export default Maths
