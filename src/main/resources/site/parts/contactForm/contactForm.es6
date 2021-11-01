import { GA_TRACKING_ID } from '../../pages/default/default'

const {
  getComponent,
  getContent,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

exports.get = function(req) {
  try {
    const component = getComponent()
    return renderPart(req, component.config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req) => renderPart(req, {
  dark: false
})

const renderPart = (req, config) => {
  const page = getContent()
  const language = getLanguage(page)
  const phrases = language.phrases
  const recaptchaSiteKey = app.config && app.config['RECAPTCHA_SITE_KEY'] ? app.config['RECAPTCHA_SITE_KEY'] : ''
  const contactForm = new React4xp('site/parts/contactForm/contactForm')
    .setProps({
      recaptchaSiteKey: recaptchaSiteKey,
      contactFormServiceUrl: serviceUrl({
        service: 'contactForm'
      }),
      phrases: phrases,
      language: language.code,
      GA_TRACKING_ID: GA_TRACKING_ID
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

