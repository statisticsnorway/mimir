import { React4xp, React4xpObject, React4xpResponse } from '../../../lib/types/react4xp'
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

exports.get = function(req: XP.Request): React4xpResponse {
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

  const mailChimpFormComponent: React4xpObject = new React4xp('site/parts/mailChimpForm/mailChimpForm')
    .setProps(reactProps)
    .setId('newsletterForm')
    .uniqueId()

  const thProps: ThymeleafProps = {
    title: component.config.title ? component.config.title : '',
    text: component.config.text ? component.config.text : '',
    reactId: mailChimpFormComponent.react4xpId
  }

  const thRender: string = render(view, thProps)
  return {
    body: mailChimpFormComponent.renderBody({
      body: thRender,
      clientRender: req.mode !== 'edit'
    }),
    pageContributions: mailChimpFormComponent.renderPageContributions({
      clientRender: req.mode !== 'edit'
    })
  }
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
  reactId: string;
}
