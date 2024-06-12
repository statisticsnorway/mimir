export interface LinksProps {
  children: string
  href: string
  withIcon: boolean | string
  linkType?: 'regular' | 'profiled' | 'header'
  text?: string
  description?: string
  isPDFAttachment?: boolean
  attachmentTitle?: string
}
