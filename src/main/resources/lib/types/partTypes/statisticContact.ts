export interface StatisticContactProps {
  label: string
  contacts: Array<Contact>
}

export interface Contact {
  id: number
  name: string
  email?: string
  phone?: string
  phoneLink?: string
}
