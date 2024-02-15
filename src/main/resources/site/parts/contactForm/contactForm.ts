import { getContent, serviceUrl } from '/lib/xp/portal'
import { render } from '/lib/enonic/react4xp'
import { type Language, type Phrases } from '/lib/types/language'

import { renderError } from '/lib/ssb/error/error'
import { getLanguage } from '/lib/ssb/utils/language'

export function get(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request) {
  return renderPart(req)
}

function renderPart(req: XP.Request) {
  const page = getContent()
  if (!page) throw new Error('No page found')

  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = language.phrases as Phrases
  // TODO: Hvordan håndtere localhost?
  const recaptchaSiteKey: string =
    app.config && app.config['GCP_RECAPTCHA_SITE_KEY'] && typeof app.config['GCP_RECAPTCHA_SITE_KEY'] == 'string'
      ? app.config['GCP_RECAPTCHA_SITE_KEY']
      : ''

  return render(
    'site/parts/contactForm/contactForm',
    {
      recaptchaSiteKey: recaptchaSiteKey,
      contactFormServiceUrl: serviceUrl({
        service: 'contactForm',
      }),
      phrases: phrases,
      language: language.code,
    },
    req,
    {
      id: 'contactFormId',
      pageContributions: {
        headEnd: [`<script src="https://www.google.com/recaptcha/enterprise.js?render=${recaptchaSiteKey}"></script>`],
      },
    }
  )
}
