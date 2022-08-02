import {render as r4XpRender, RenderResponse} from '/lib/enonic/react4xp'
import { ResourceKey, render } from '/lib/thymeleaf'
import { getComponent,
        getContent,
        Component } from '/lib/xp/portal'
import { MailChimpFormPartConfig } from './mailChimpForm-part-config'
import { Content } from '/lib/xp/content'
import { I18nLibrary } from '/lib/xp/i18n'



const {
  localize
}: I18nLibrary = __non_webpack_require__('/lib/xp/i18n')

const view: ResourceKey = resolve('./mailChimpForm.html')

exports.get = function(req: XP.Request): RenderResponse {
  const component: Component<MailChimpFormPartConfig> = getComponent()
  const content: Content = getContent()

  const reactProps: ReactProps = {
    endpoint: component.config.mailchimpEndpoint ? component.config.mailchimpEndpoint : '',
    id: component.config.mailchimpId ? component.config.mailchimpId : '',
    validateEmailMsg: localize({
      key: 'newsletter.emailVerificationError',
      locale: content.language ? content.language : 'nb'
    }),
    emailLabel: localize({
      key: 'newsletter.emailLabel',
      locale: content.language ? content.language : 'nb'
    }),
    buttonTitle: localize({
      key: 'newsletter.buttonTitle',
      locale: content.language ? content.language : 'nb'
    })
  }

  const thProps: ThymeleafProps = {
    title: component.config.title ? component.config.title : '',
    text: component.config.text ? component.config.text : ''
  }

  return r4XpRender('site/parts/mailChimpForm/mailChimpForm',
    reactProps,
    req,
      {
        body: render(view, thProps),
        clientRender: req.mode !== 'edit'
      })
}

interface ReactProps {
  endpoint: string;
  id: string;
  validateEmailMsg: string;
  emailLabel: string;
  buttonTitle: string;
}

interface ThymeleafProps {
  title: string;
  text: string;
}
