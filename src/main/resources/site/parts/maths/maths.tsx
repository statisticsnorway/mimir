import React from 'react'
import { MathJaxContext, MathJax } from 'better-react-mathjax'

interface MathsProps {
  mathsFormula: string
}

const Maths: React.FC<MathsProps> = ({ mathsFormula }) => {
  const config = {
    loader: {
      load: ['output/svg'], // v3.0
    },
    options: {
      // Since the MathJax formula output is SVG, it will be accessible for screen readers, so we don't need the extra fluff
      renderActions: {
        addMenu: [0, '', ''], // Disable context menu
        assistiveMml: [], // Overriding this option, which is on by default, prevents mjx-assistive-mml from rendering in the DOM.
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
