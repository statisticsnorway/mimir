export interface LinksProps {
  children: string
  href: string
  withIcon: boolean | string
  linkType?: 'regular' | 'profiled' | 'header'
  text?: string
  description?: string
  GA_TRACKING_ID?: string
  isPDFAttachment?: boolean
  attachmentTitle?: string
}
