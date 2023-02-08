import { render as r4XpRender, type RenderResponse } from '/lib/enonic/react4xp'
import { getComponent, getContent } from '/lib/xp/portal'
import type { MailChimpKostra as MailChimpKostraPartConfig } from '.'
import { Phrases } from '/lib/types/language'

const { getPhrases } = __non_webpack_require__('/lib/ssb/utils/language')

export function get(req: XP.Request): RenderResponse {
  const config: MailChimpKostraPartConfig = getComponent().config
  const phrases: Phrases = getPhrases(getContent()) as Phrases

  const props: MailChimpFormKostraProps = {
    ingress: config.ingress ?? '',
    nameLabel: phrases['newsletter.nameLabel'],
    emailLabel: phrases['newsletter.emailLabel'],
    buttonTitle: phrases['newsletter.buttonTitle'],
  }

  return r4XpRender('site/parts/mailChimpKostra/mailChimpKostra', props, req, {
    clientRender: req.mode !== 'edit',
  })
}

interface MailChimpFormKostraProps {
  ingress: string
  nameLabel: string
  emailLabel: string
  buttonTitle: string
}
