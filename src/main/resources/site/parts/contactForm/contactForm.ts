import {React4xp} from "../../../lib/types/react4xp";
import {PageContributions, Request} from "enonic-types/controller";
import {Component} from "enonic-types/portal";
import {Content, Page} from "enonic-types/content";
import {Statistics} from "../../content-types/statistics/statistics";
import {Article} from "../../content-types/article/article";
import {Language, Phrases} from "../../../lib/types/language";

const {
  getComponent,
  getContent,
  serviceUrl
} = __non_webpack_require__('/lib/xp/portal')
const {
  renderError
} = __non_webpack_require__('/lib/ssb/error/error')

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

exports.get = function(req: Request) {
  try {
    const component: Component<any> = getComponent()
    return renderPart(req, component.config)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request) => renderPart(req, {
  dark: false
})

const renderPart = (req: Request, config: object) => {
  const page: Content = getContent()
  const language: Language = getLanguage(page)
  const phrases: Phrases = language.phrases as Phrases
  const recaptchaSiteKey = app.config && app.config['RECAPTCHA_SITE_KEY'] ? app.config['RECAPTCHA_SITE_KEY'] : ''
  const contactForm = new React4xp('site/parts/contactForm/contactForm')
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

