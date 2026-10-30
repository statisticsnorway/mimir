export interface ContactModel {
  contactTitle: string
  contacts: Array<Array<Contact>>
}

export interface Contact {
  id: number | string
  name: string
  email?: string
  phone?: string
  phoneLink?: string
}
