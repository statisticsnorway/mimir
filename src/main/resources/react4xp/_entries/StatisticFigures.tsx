import React from 'react'
import { Title } from '@statisticsnorway/ssb-component-library'
import { ArrowRight } from 'react-feather'

import { type StatisticFiguresProps } from '/lib/types/partTypes/statisticFigures'

import AttachmentTablesFigures from '../attachmentTablesFigures/AttachmentTablesFigures'

function StatisticFigures(props: Readonly<StatisticFiguresProps>) {
  const { selectedFigures, statbankBoxTitle, statbankBoxText, icon, iconStatbankBox, statbankHref } = props

  function renderStatbankBox() {
    return (
      <div className='statbank-box'>
        <div className='content'>
          <div className='icon-wrapper'>
            <img src={iconStatbankBox} alt='' />
          </div>
          <div className='title-text-wrapper'>
            <a className='title' href={statbankHref} id='statbankLink'>
              {statbankBoxTitle}
            </a>
            <span className='text'>{statbankBoxText}</span>
          </div>
          <ArrowRight size={28} className='arrow-icon' aria-hidden='true' />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className='title-wrapper'>
        <Title size={2}>{selectedFigures}</Title>
        <div className='icon-wrapper'>
          <img src={icon} alt='' />
        </div>
      </div>
      <AttachmentTablesFigures {...props} />
      {renderStatbankBox()}
    </>
  )
}

export default (props: StatisticFiguresProps) => <StatisticFigures {...props} />
