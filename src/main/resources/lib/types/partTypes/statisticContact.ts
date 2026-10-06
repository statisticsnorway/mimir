export interface StatisticContactProps {
  label: string
  contacts: Contact[]
}

export interface Contact {
  id: number | string
  name: string
  email?: string
  phone?: string
  phoneLink?: string
}
