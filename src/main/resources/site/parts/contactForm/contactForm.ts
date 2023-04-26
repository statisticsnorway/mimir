import { render, type RenderResponse } from '/lib/enonic/react4xp'
import type { Content } from '/lib/xp/content'
import type { Language, Phrases } from '/lib/types/language'
import { getContent, serviceUrl } from '/lib/xp/portal'

const { renderError } = __non_webpack_require__('/lib/ssb/error/error')
const { getLanguage } = __non_webpack_require__('/lib/ssb/utils/language')

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

function renderPart(req: XP.Request): RenderResponse {
  const page: Content = getContent()
  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = language.phrases as Phrases
  const recaptchaSiteKey: string =
    app.config && app.config['RECAPTCHA_SITE_KEY'] && typeof app.config['RECAPTCHA_SITE_KEY'] == 'string'
      ? app.config['RECAPTCHA_SITE_KEY']
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
        headEnd: [`<script src="https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}"></script>`],
      },
    }
  )
}
