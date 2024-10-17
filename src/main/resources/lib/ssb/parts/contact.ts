import { type Contact as StatRegContacts } from '/lib/ssb/dashboard/statreg/types'
import { type Contact } from '/lib/types/partTypes/statisticContact'
import { find } from '/lib/vendor/ramda'

function splitPhoneNumber(number: string): string {
  return number?.match(/.{1,2}/g)?.join(' ') || ''
}

const landCodeVisual = '(+47) '
const landCode = '+47'

export function transformContact(contact: StatRegContacts, language: string): Contact {
  return {
    id: contact.id,
    name: contact.name,
    email: contact.email,
    phone:
      language == 'en' && contact.telephone != ''
        ? landCodeVisual.concat(splitPhoneNumber(contact.telephone as string))
        : splitPhoneNumber(contact.telephone as string),
    phoneLink: landCode.concat(contact.telephone as string),
  }
}

export function getSelectedContacts(
  contactIds: Array<string>,
  statRegContacts: Array<StatRegContacts>,
  language: string
): Contact[] {
  return contactIds.reduce((acc: Array<Contact>, contactId) => {
    const found: StatRegContacts | undefined = statRegContacts
      ? find((contact: StatRegContacts) => `${contact.id}` === `${contactId}`)(statRegContacts)
      : undefined
    return found ? acc.concat(transformContact(found, language)) : acc
  }, [])
}
