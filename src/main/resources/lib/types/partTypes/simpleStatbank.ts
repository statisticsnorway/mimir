export interface SimpleStatbankProps {
  icon?: string | null
  altText?: string
  ingress: string
  placeholder?: string
  resultLayout: string
  simpleStatbankServiceUrl?: string
  json?: string
  code?: string
  urlOrId?: string
  selectDisplay?: string
  statbankApiData?: SimpleStatbankResult | undefined
}

export interface SimpleStatbankResult {
  data: DimensionData[]
}

export interface DimensionData {
  displayName: string
  dataCode: string
  value: (string | number)[]
  time: string
}
