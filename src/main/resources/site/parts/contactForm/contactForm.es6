const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')
const {
  render
} = __non_webpack_require__('/lib/thymeleaf')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const view = resolve('./contactForm.html')

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
  const contactForm = new React4xp('ContactForm')
    .setProps({
      emailGeneral: 'ssbno_teknisk@ssb.no',
      emailStatistikk: 'ssbno_teknisk@ssb.no',
      emailInnrapportering: 'ssbno_teknisk@ssb.no'
    }
    )
    .setId('contactFormId')
    .uniqueId()

  const body = render(view, {
    contactFormId: contactForm.react4xpId
  })
  return {
    body: contactForm.renderBody({
      body
    }),
    pageContributions: contactForm.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
}

