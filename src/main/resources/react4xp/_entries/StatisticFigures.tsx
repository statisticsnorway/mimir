import React from 'react'
import { Title } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

import { type StatisticFiguresProps } from '/lib/types/partTypes/statisticFigures'

import AttachmentTablesFigures from '../attachmentTablesFigures/AttachmentTablesFigures'

function StatisticFigures(props: Readonly<StatisticFiguresProps>) {
  const { selectedFigures, statbankBoxTitle, statbankBoxText, iconStatbankBox, statbankHref, accordions } = props

  function renderStatbankBox() {
    return (
      <div className='statbank-box'>
        <a href={statbankHref} id='statbankLink'>
          <div className='content'>
            <div className='icon-wrapper'>
              <img src={iconStatbankBox} alt='' />
            </div>
            <div className='title-text-wrapper'>
              <span className='title'>{statbankBoxTitle}</span>
              <span className='ssb-paragraph'>{statbankBoxText}</span>
            </div>
            <ArrowRight size={28} className='arrow-icon' aria-hidden='true' />
          </div>
        </a>
      </div>
    )
  }

  return (
    <div className='content-wrapper'>
      {accordions?.length ? (
        <>
          <div className='title-wrapper'>
            <Title size={2}>{selectedFigures}</Title>
          </div>
          <AttachmentTablesFigures {...props} />
        </>
      ) : null}
      {renderStatbankBox()}
    </div>
  )
}

export default (props: StatisticFiguresProps) => <StatisticFigures {...props} />
