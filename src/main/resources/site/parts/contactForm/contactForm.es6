const {
  getComponent,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')

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
  const recaptchaSiteKey = app.config && app.config['RECAPTCHA_SITE_KEY'] ? app.config['RECAPTCHA_SITE_KEY'] : ''
  const contactForm = new React4xp('site/parts/contactForm/contactForm')
    .setProps({
      emailGeneral: 'ssbno_teknisk@ssb.no',
      emailStatistikk: 'ssbno_teknisk@ssb.no',
      emailInnrapportering: 'ssbno_teknisk@ssb.no',
      recaptchaSiteKey: recaptchaSiteKey,
      contactFormServiceUrl: serviceUrl({
        service: 'contactForm'
      })
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

