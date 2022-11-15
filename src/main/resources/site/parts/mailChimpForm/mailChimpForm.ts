import { render as r4XpRender, type RenderResponse } from '/lib/enonic/react4xp'
import { type ResourceKey, render } from '/lib/thymeleaf'
import { getComponent, getContent, type Component } from '/lib/xp/portal'
import type { MailChimpFormPartConfig } from './mailChimpForm-part-config'
import type { Content } from '/lib/xp/content'
import { localize } from '/lib/xp/i18n'

const view: ResourceKey = resolve('./mailChimpForm.html')

export function get(req: XP.Request): RenderResponse {
  const component: Component<MailChimpFormPartConfig> = getComponent()
  const content: Content = getContent()

  const reactProps: ReactProps = {
    endpoint: component.config.mailchimpEndpoint ? component.config.mailchimpEndpoint : '',
    id: component.config.mailchimpId ? component.config.mailchimpId : '',
    validateEmailMsg: localize({
      key: 'newsletter.emailVerificationError',
      locale: content.language ? content.language : 'nb',
    }),
    emailLabel: localize({
      key: 'newsletter.emailLabel',
      locale: content.language ? content.language : 'nb',
    }),
    buttonTitle: localize({
      key: 'newsletter.buttonTitle',
      locale: content.language ? content.language : 'nb',
    }),
  }

  const thProps: ThymeleafProps = {
    title: component.config.title ? component.config.title : '',
    text: component.config.text ? component.config.text : '',
  }

  return r4XpRender('site/parts/mailChimpForm/mailChimpForm', reactProps, req, {
    body: render(view, thProps),
    clientRender: req.mode !== 'edit',
  })
}

interface ReactProps {
  endpoint: string
  id: string
  validateEmailMsg: string
  emailLabel: string
  buttonTitle: string
}

interface ThymeleafProps {
  title: string
  text: string
}
