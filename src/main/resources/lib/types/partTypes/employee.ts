export interface EmployeeProps {
  title: string
  email: string
  position: string
  phone: string
  description: string
  profileImages: Array<string>
  myCV: string | null
  projects: Array<Project>
  area: Area | null
  isResearcher: boolean
  cristinId: string | null
  cvInformation: CVinformation
  emailPhrase: string
  phonePhrase: string
  positionPhrase: string
  researchAreaPhrase: string
  departmentPhrase: string
  briefSummaryPhrase: string
  projectsPhrase: string
  downloadPdfPhrase: string
  publicationsPhrase: string
  pressPicturesPhrase: string
  pressPicturesDescrPhrase: string
  pressPictureLabelPhrase: string
  imagePhrase: string
}

export interface Project {
  href: string
  title: string
  description: string
}

export interface Area {
  href: string
  title: string
}

export interface CVinformation {
  name: string
  size: number
  mimeType: string
}
