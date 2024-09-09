import React from 'react'
import { Row } from 'react-bootstrap'
import { ExpansionBox, Title } from '@statisticsnorway/ssb-component-library'
import { User } from 'react-feather'
//import { type ContactModel } from '../../../lib/types/partTypes/contact'
import { type StatisticContactProps, type Contact } from '/lib/types/partTypes/statisticContact'

function StatisticContact(props: StatisticContactProps) {
  const { label, contacts } = props

  console.log('Kontakter: ' + JSON.stringify(contacts, null, 4))

  function contactInfo(contact: Contact) {
    return (
      <div className='contact'>
        {contact.email && (
          <p className='part-contact-email mb-0'>
            <a className='roboto-plain ssb-link stand-alone' href="@{'mailto:' + ${contact.email}}">
              {contact.email}
            </a>
          </p>
        )}
        {contact.phone != '' && (
          <p className='part-contact-telephone'>
            <a
              className='ssb-link stand-alone'
              data-th-text='${contact.telephone}'
              href="@{'tel:' + ${contact.phonelink}}"
            >
              {contact.phone}
            </a>
          </p>
        )}
      </div>
    )
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
        <div className='contacts mb-4'>
          {contacts?.length && (
            <div className='om-statistikken-tags'>
              {contacts.map((contact) => (
                <ExpansionBox className='mb-4' header={contact.name} text={contactInfo(contact)} openByDefault />
              ))}
            </div>
          )}
        </div>
      </Row>
    </section>
  )
}

export default (props: StatisticContactProps) => <StatisticContact {...props} />
