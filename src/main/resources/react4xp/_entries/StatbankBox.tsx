import React from 'react'
import { ArrowRight } from 'react-feather'
import { type StatbankBoxProps } from '../../lib/types/partTypes/statbankBox'

const StatbankBox = (props: StatbankBoxProps) => {
  const { title, href, icon, fullWidth } = props

  return (
    <div className='container-fluid p-0'>
      <div className='row'>
        <a
          className={`statbank-link ${fullWidth ? 'col-lg-12' : 'col-lg-7'}`}
          href={href}
          id='statbankLink'
          aria-label={title}
        >
          <div className='content'>
            <div className='icon-wrapper'>
              <img src={icon} alt='' />
            </div>
            <div className='title-wrapper'>
              <h3 className='title'>{title}</h3>
            </div>
            {fullWidth && <ArrowRight size={28} className='arrow-icon' aria-hidden='true' />}
          </div>
        </a>
      </div>
    </div>
  )
}

export default (props: StatbankBoxProps) => <StatbankBox {...props} />
