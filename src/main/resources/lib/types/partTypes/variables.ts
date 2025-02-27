export interface Variables {
  title: string
  description: string
  href: string
  fileHref: string
  fileModifiedDate: string
}

export type VariablesProps = {
  variables: {
    title: string
    description: string
    fileLocation: string
    downloadText: string
    href: string
    icon?: string
  }[]
  display?: string
}
