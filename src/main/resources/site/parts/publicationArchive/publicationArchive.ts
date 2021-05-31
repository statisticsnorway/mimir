import { Request } from 'enonic-types/controller'
import { I18nLibrary } from 'enonic-types/i18n'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { PublicationArchivePartConfig } from './publicationArchive-part-config'

const {
  localize
}: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')
const {
  getContent, serviceUrl, getComponent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')

exports.get = (req: Request): React4xpResponse => {
  return renderPart(req)
}

exports.preview = (req: Request): React4xpResponse => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const content: Content = getContent()
  const part: Component<PublicationArchivePartConfig> = getComponent()
  const language: string = content.language ? content.language : 'nb'
  const isNotInEditMode: boolean = req.mode !== 'edit'
  const publicationArchiveServiceUrl: string = serviceUrl({
    service: 'publicationArchive'
  })

  const buttonTitle: string = localize({
    key: 'button.showMore',
    locale: language === 'nb' ? 'no' : language
  })

  const props: PartProperties = {
    title: 'Publikasjonsarkiv',
    ingress: part.config.ingress || '',
    buttonTitle,
    language,
    publicationArchiveServiceUrl
  }

  return React4xp.render('site/parts/publicationArchive/publicationArchive', props, req, {
    clientRender: isNotInEditMode
  })
}

interface PartProperties {
  title: string;
  ingress: string;
  buttonTitle: string;
  language: string;
  publicationArchiveServiceUrl: string;
}
