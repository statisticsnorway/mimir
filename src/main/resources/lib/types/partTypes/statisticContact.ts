export interface StatisticContactProps {
  icon: string
  label: string
  contacts: Contact[]
}

export interface Contact {
  id: number
  name: string
  email?: string
  phone?: string
  phoneLink?: string
}
