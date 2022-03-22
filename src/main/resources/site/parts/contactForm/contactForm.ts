import {React4xp, React4xpObject, React4xpResponse} from '../../../lib/types/react4xp';
import {Request, Response} from "enonic-types/controller";
import {Content} from "enonic-types/content";
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

const React4xp: React4xp = __non_webpack_require__('/lib/enonic/react4xp') as React4xp
const {
  getLanguage
} = __non_webpack_require__('/lib/ssb/utils/language')

exports.get = function(req: Request) {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

exports.preview = (req: Request) => renderPart(req)

function renderPart(req: Request): React4xpResponse {
  const page: Content<Article> = getContent() // TODO Check if article is remotely right here
  const language: Language = getLanguage(page) as Language
  const phrases: Phrases = language.phrases as Phrases
  const recaptchaSiteKey: string = app.config && app.config['RECAPTCHA_SITE_KEY'] ? app.config['RECAPTCHA_SITE_KEY'] : ''
  const urlToService: string = serviceUrl({
      service: 'contactForm'
  })
    log.info('GLNRBN url: ' + urlToService)
  const contactForm: React4xpObject = new React4xp('site/parts/contactForm/contactForm')
    .setProps({
      recaptchaSiteKey: recaptchaSiteKey,
      contactFormServiceUrl: urlToService,
      phrases: phrases,
      language: language.code
    }
    )
    .setId('contactFormId')
    .uniqueId()

  return {
    body: contactForm.renderBody(),
    pageContributions: {
        headEnd: [
          `<script src="https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}"></script>`
        ]
    },
    clientRender: req.mode !== 'edit'
  }
}

