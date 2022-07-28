import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
import { Content } from 'enonic-types/content'
import { Language, Phrases } from '../../../lib/types/language'

const {
  getContent,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

exports.get = function(req: XP.Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: XP.Request) => renderPart(req)

function renderPart(req: XP.Request): React4xpResponse {
  const page: Content = getContent()
  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = language.phrases as Phrases
  const recaptchaSiteKey: string = app.config &&
    app.config['RECAPTCHA_SITE_KEY'] &&
    typeof app.config['RECAPTCHA_SITE_KEY'] == 'string' ? app.config['RECAPTCHA_SITE_KEY'] : ''

  const contactForm: React4xpObject = new React4xp('site/parts/contactForm/contactForm')
    .setProps({
      recaptchaSiteKey: recaptchaSiteKey,
      contactFormServiceUrl: serviceUrl({
        service: 'contactForm'
      }),
      phrases: phrases,
      language: language.code
    }
    )
    .setId('contactFormId')
    .uniqueId()

  return {
    body: contactForm.renderBody(),
    pageContributions: contactForm.renderPageContributions({
      pageContributions: {
        headEnd: [
          `<script src="https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}"></script>`
        ]
      },
      clientRender: req.mode !== 'edit'
    })
  }
}

