import React from 'react'
import { MathJaxContext, MathJax } from 'better-react-mathjax'

interface MathsProps {
  mathsFormula: string
}

const Maths: React.FC<MathsProps> = ({ mathsFormula }) => {
  return (
    <MathJaxContext>
      <MathJax>
        <span className='d-flex justify-content-center'>{`\\(${mathsFormula}\\)`}</span>
      </MathJax>
    </MathJaxContext>
  )
}

export default Maths
