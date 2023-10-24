import { Content, getComponent, getContent } from '/lib/xp/portal'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { Phrases } from '/lib/types/language'

import { getPhrases } from '/lib/ssb/utils/language'

export function get(req: XP.Request) {
  const config = getComponent<XP.PartComponent.MailChimpForm>()?.config
  if (!config) throw Error('No part found')

  const currentContent = getContent() ?? ({} as Content)
  const phrases = getPhrases(currentContent) as Phrases

  const props: PartProps = {
    text: config.text ?? '',
    endpoint: config.mailchimpEndpoint ?? '',
    id: config.mailchimpId,
    validateEmailMsg: phrases['newsletter.emailVerificationError'],
    emailLabel: phrases['newsletter.emailLabel'],
    buttonTitle: phrases['newsletter.buttonTitle'],
  }

  return r4XpRender('site/parts/mailChimpForm/mailChimpForm', props, req)
}

interface PartProps {
  text: string
  endpoint: string
  id: string | undefined
  validateEmailMsg: string
  emailLabel: string
  buttonTitle: string
}
