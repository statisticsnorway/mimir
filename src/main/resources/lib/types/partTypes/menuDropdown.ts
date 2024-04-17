import { type MunicipalityWithCounty } from '../municipalities'

export interface MenuDropdownProps {
  modeMunicipality: boolean
  ariaLabel: string
  placeholder: string
  items: Municipality[]
  baseUrl: string
  dataPathAssetUrl: string
  dataServiceUrl: string
  municipality: MunicipalityWithCounty | undefined
  municipalityName: string | undefined
  municipalityList: Array<Municipality>
  dropdownId: string
}

export interface Municipality {
  id: string
  title: string
}
