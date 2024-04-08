export interface MunicipalityChangeList {
  codeChanges: Array<MunicipalityChange>
}

export interface MunicipalityChange {
  oldCode: string
  oldName: string
  oldShortName?: string
  newCode: string
  newName: string
  newShortName?: string
  changeOccurred: string
}

export interface RequestWithCode extends XP.Request {
  code: string
}

export interface MunicipalCode {
  code: string
  parentCode: string
  level: string
  name: string
  shortName: string
  presentationName: string
}

export interface MunicipalityWithCounty {
  code: string
  displayName: string
  county: {
    name: string
  }
  path: string
  changes?: Array<MunicipalityChange>
}
