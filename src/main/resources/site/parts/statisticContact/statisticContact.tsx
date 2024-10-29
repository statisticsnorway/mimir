import React from 'react'
import { Link, Title } from '@statisticsnorway/ssb-component-library'
import { type StatisticContactProps, type Contact } from '/lib/types/partTypes/statisticContact'

function StatisticContact(props: Readonly<StatisticContactProps>) {
  const { icon, label, contacts } = props

  function renderContact(contact: Contact) {
    return (
      <div className='contact col-12 col-md-6 col-lg-4'>
        <Title size={3} className='name text-wrap'>
          {contact.name}
        </Title>
        {contact.email && (
          <Link className='email' href={`mailto:${contact.email}`} standAlone>
            {contact.email}
          </Link>
        )}
        {contact.phone != '' && (
          <Link className='phone' href={`tel:${contact.phoneLink}`} standAlone>
            {contact.phone}
          </Link>
        )}
      </div>
    )
  }

  function renderContactsInfo() {
    if (contacts.length) {
      return <div className='contact-wrapper'>{contacts.map((contact) => renderContact(contact))}</div>
    }
    return null
  }

  return (
    <div className='content-wrapper'>
      <div className='title-wrapper'>
        <Title size={2}>{label}</Title>
        <div className='icon-wrapper'>
          <img src={icon} alt='' />
        </div>
      </div>
      {contacts.length > 0 && <div className='contact-list'>{renderContactsInfo()}</div>}
    </div>
  )
}

export default (props: StatisticContactProps) => <StatisticContact {...props} />
