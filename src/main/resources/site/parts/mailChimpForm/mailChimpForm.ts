import { Request } from 'enonic-types/controller'
import { React4xp, React4xpResponse } from '../../../lib/types/react4xp'
import { ResourceKey, ThymeleafLibrary } from 'enonic-types/thymeleaf'
import { Component, PortalLibrary } from 'enonic-types/portal'
import { MailChimpFormPartConfig } from './mailChimpForm-part-config'
const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  render
}: ThymeleafLibrary = __non_webpack_require__('/lib/thymeleaf')
const {
  getComponent
}: PortalLibrary = __non_webpack_require__('/lib/xp/portal')
const view: ResourceKey = resolve('./mailChimpForm.html')

exports.get = function(req: Request): React4xpResponse {
  const component: Component<MailChimpFormPartConfig> = getComponent()
  const thProps: {title: string; bodyText: string; reactId: string} = {
    title: component.config.title ? component.config.title : '',
    bodyText: component.config.text ? component.config.text : '',
    reactId: ''
  }

  const reactProps: {endpoint: string; id: string} = {
    endpoint: '',
    id: ''
  }

  const thRender: string = render(view, thProps)
  return React4xp.render('site/parts/mailChimpForm/mailChimpForm', reactProps, req)
}
