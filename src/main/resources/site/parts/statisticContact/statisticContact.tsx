import React from 'react'
import { Title } from '@statisticsnorway/ssb-component-library'
import { Info } from 'react-feather'
import { type ContactModel } from '../../../lib/types/partTypes/contact'

function StatisticContact(props: ContactModel) {
  const { contactTitle, contacts } = props

  return (
    <div className='row'>
      <div className='title-wrapper'>
        <Title size={2}>{contactTitle}</Title>
        <div className='icon-wrapper'>
          <Info size={52} />
        </div>
      </div>
      <div className='contacts'>
        <p>{contacts.length}</p>
        {/* {contacts.map((contact, index) => (
          {renderContact(contact)}
        ))}  */}
      </div>
    </div>
  )
}

export default (props: ContactModel) => <StatisticContact {...props} />
