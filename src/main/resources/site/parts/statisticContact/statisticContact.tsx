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
      <div className='contact col-auto col-12 col-lg-4'>
        <Title size={3} className='contact-name'>
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
      return <div className='contacts'>{contacts.map((contact) => renderContact(contact))}</div>
    }
    return null
  }

  return (
    <section className='xp-part statistic-contacts'>
      <Row>
        <div className='title-wrapper'>
          <Title size={2}>{label}</Title>
          <div className='icon-wrapper'>
            <User size={52} />
          </div>
        </div>
        {contacts?.length && <ExpansionBox className='mb-4' header={label} text={contactsInfo()} openByDefault />}
      </Row>
    </section>
  )
}

export default (props: StatisticContactProps) => <StatisticContact {...props} />
