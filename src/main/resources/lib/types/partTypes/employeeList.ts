export interface EmployeeListProps {
  employees: IEmployeeMap[]
  total: number
  pageTitle: string
  pageDescription: string
}

export interface IEmployeeMap {
  alphabet: string
  record: IPreparedEmployee[]
}

export interface IPreparedEmployee {
  surname: string
  name: string
  position: string
  path: string
  phone: string
  email: string
  area: string | Area
}

export interface Area {
  href: string
  title: string
}

export interface IObjectKeys {
  [key: string]: IEmployeeMap
}
