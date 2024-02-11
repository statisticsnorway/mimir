import React from 'react'
import { Glossary as SSBGlossary } from '@statisticsnorway/ssb-component-library'

interface GlossaryProps {
  text: string;
  explanation: string;
}

const Glossary = (props: GlossaryProps) => <SSBGlossary explanation={props.explanation}>{props.text}</SSBGlossary>

export default Glossary
