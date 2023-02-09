import { render as r4XpRender, type RenderResponse } from '/lib/enonic/react4xp'
import { getComponent, getContent, type Component } from '/lib/xp/portal'
import type { MailChimpForm as MailChimpFormPartConfig } from '.'
import { Phrases } from '/lib/types/language'

const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request): RenderResponse {
  const component: Component<MailChimpFormPartConfig> = getComponent()
  const phrases: Phrases = getPhrases(getContent()) as Phrases

  const reactProps: ReactProps = {
    title: component.config.title ?? '',
    text: component.config.text ?? '',
    endpoint: component.config.mailchimpEndpoint ?? '',
    id: component.config.mailchimpId ?? component.config.mailchimpId,
    validateEmailMsg: phrases['newsletter.emailVerificationError'],
    emailLabel: phrases['newsletter.emailLabel'],
    buttonTitle: phrases['newsletter.buttonTitle'],
  }

  return r4XpRender('site/parts/mailChimpForm/mailChimpForm', reactProps, req, {
    clientRender: req.mode !== 'edit',
  })
}

interface ReactProps {
  title: string
  text: string
  endpoint: string
  id: string | undefined
  validateEmailMsg: string
  emailLabel: string
  buttonTitle: string
}
