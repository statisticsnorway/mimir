export interface StatisticContactProps {
  label: string
  contacts: Array<Contact>
}

interface Contact {
  name: string
  email?: string
  phone?: string
}
