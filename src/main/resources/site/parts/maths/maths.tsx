import React from 'react'
import MathJax from 'react-mathjax'

interface MathsProps {
  mathsFormula: string
}

const Maths: React.FC<MathsProps> = ({ mathsFormula }) => {
  return (
    <MathJax.Provider>
      <MathJax.Node formula={mathsFormula} />
    </MathJax.Provider>
  )
}

export default Maths
