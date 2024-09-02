import React from 'react'
import Accordion from '/react4xp/accordion/Accordion'
import { type AboutTheStatisticsProps } from '../../../lib/types/partTypes/omStatistikken'

const OmStatistikken = (props: AboutTheStatisticsProps) => {
  const { ingress, label, lastUpdatedPhrase, lastUpdated, accordions } = props

  function renderIngress() {
    if (ingress) {
      return <p className='ingress-wrapper searchabletext col-lg-6'>{ingress}</p>
    }
    return null
  }
  return (
    <div className='row'>
      <h2 className='title-wrapper col-12'>{label}</h2>
      {renderIngress()}
      {lastUpdated && (
        <p>
          <i>{`${lastUpdatedPhrase} ${lastUpdated}.`}</i>
        </p>
      )}
      <div className='om-statistikken-accordion col-lg-7'>
        <Accordion accordions={accordions} />
      </div>
    </div>
  )
}

export default OmStatistikken
