import React from 'react'
import { Row } from 'react-bootstrap'
import { Link, ExpansionBox, Title } from '@statisticsnorway/ssb-component-library'
import { User } from 'react-feather'
//import { type ContactModel } from '../../../lib/types/partTypes/contact'
import { type StatisticContactProps, type Contact } from '/lib/types/partTypes/statisticContact'

function StatisticContact(props: StatisticContactProps) {
  const { label, contacts } = props

  console.log('Kontakter: ' + JSON.stringify(contacts, null, 4))

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

  function contactsInfo() {
    if (contacts?.length) {
      return <Row className='contact-info'>{contacts.map((contact) => renderContact(contact))}</Row>
    }
    return null
  }

  return (
    <React.Fragment>
      <div className='title-wrapper'>
        <Title size={2}>{label}</Title>
        <div className='icon-wrapper'>
          <User size={52} />
        </div>
      </div>
      {contacts?.length && <ExpansionBox header={label} text={contactsInfo()} openByDefault />}
    </React.Fragment>
  )
}

export default (props: StatisticContactProps) => <StatisticContact {...props} />
