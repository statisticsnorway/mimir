import { Contact } from '/site/content-types/contact'

export interface ContactModel {
  contactTitle: string
  contacts: Array<Array<TransformedContact>>
}

export interface TransformedContact extends Contact {
  phonelink: string
}
