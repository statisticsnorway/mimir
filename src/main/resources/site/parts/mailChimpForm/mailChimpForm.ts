import { render as r4XpRender } from '/lib/enonic/react4xp'
import { getComponent, getContent } from '/lib/xp/portal'
import { Phrases } from '/lib/types/language'

const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request) {
  const config = getComponent<XP.PartComponent.MailChimpForm>()?.config
  if (!config) throw Error('No part found')

  const phrases: Phrases = getPhrases(getContent()) as Phrases

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
