import React from 'react'
import { Row } from 'react-bootstrap'
import { Link, Title } from '@statisticsnorway/ssb-component-library'
import { User } from 'react-feather'
//import { type ContactModel } from '../../../lib/types/partTypes/contact'
import { type StatisticContactProps, type Contact } from '/lib/types/partTypes/statisticContact'

function StatisticContact(props: StatisticContactProps) {
  const { label, contacts } = props

  function renderContact(contact: Contact) {
    return (
      <div className='contact col-md-4 col-lg-3'>
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
    if (contacts?.length) {
      return <div className='contact-wrapper'>{contacts.map((contact) => renderContact(contact))}</div>
    }
    return null
  }

  return (
    <Row>
      <div className='title-wrapper'>
        <Title size={2}>{label}</Title>
        <div className='icon-wrapper'>
          <User size={52} />
        </div>
      </div>
      {contacts?.length && <div className='contact-list'>{renderContactsInfo()}</div>}
    </Row>
  )
}

export default (props: StatisticContactProps) => <StatisticContact {...props} />
