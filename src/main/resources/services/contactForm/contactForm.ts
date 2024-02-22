import { type SendMessageParams, send } from '/lib/xp/mail'
import { type HttpRequestParams, type HttpResponse, request } from '/lib/http-client'

export const post = (req: XP.Request): XP.Response => {
  const formData: ContactFormData = JSON.parse(req.body)

  log.info('\n\n## data\n--------------\n%s\n', JSON.stringify(formData, null, 4))

  const siteKey = app.config && app.config['GCP_RECAPTCHA_SITE_KEY'] ? app.config['GCP_RECAPTCHA_SITE_KEY'] : null
  const secret = app.config && app.config['GCP_API_KEY'] ? app.config['GCP_API_KEY'] : null
  const gcpProject = app.config && app.config['GCP_PROJECT'] ? app.config['GCP_PROJECT'] : null
  if (secret && siteKey && gcpProject) {
    const json = JSON.stringify({
      event: {
        siteKey,
        token: formData.token,
      },
    })
    const requestParams: HttpRequestParams = {
      url: `https://recaptchaenterprise.googleapis.com/v1/projects/${gcpProject}/assessments?key=${secret}`,
      method: 'POST',
      body: json,
    }
    const response: HttpResponse = request(requestParams)
    const recaptchaInfo: RecaptchaResponse | null = response.body ? JSON.parse(response.body) : null

    if (
      recaptchaInfo &&
      recaptchaInfo.tokenProperties.valid &&
      recaptchaInfo.riskAnalysis.score > 0.5 &&
      recaptchaInfo.tokenProperties.action === 'submitContactForm'
    ) {
      return postMail(formData)
    }
  }

  return {
    status: 400,
    contentType: 'application/json',
    body: {
      success: false,
      message: 'Henvendelsen din ble desverre ikke godkjent, prøv igjen',
    },
  }
}

interface ContactFormData {
  token: string
  email: string
  name: string
  text: string
  language?: string
  receiver: {
    id: string
    title: string
  }
}

interface RecaptchaResponse {
  riskAnalysis: {
    score: number
    reasons: []
  }
  tokenProperties: {
    valid: boolean
    invalidReason: string
    action: string
    createTime: Date
  }
}

function postMail(formData: ContactFormData): XP.Response {
  const emailParams: SendMessageParams = {
    from: 'noreply@ssb.no',
    to: getReceiverEmail(formData.receiver.id),
    subject: 'Forespørsel SSB - ' + formData.receiver.title,
    body: `Språk: ${formData.language ? formData.language : 'no'}
Navn: ${formData.name}
Epost: ${formData.email}

Spørsmål: ${formData.text}`,
  }

  const isSent: boolean = send(emailParams)

  if (isSent) {
    return {
      status: 200,
      contentType: 'application/json',
      body: {
        success: true,
        message: 'Skjemaet ble sendt',
      },
    }
  } else {
    return {
      status: 400,
      contentType: 'application/json',
      body: {
        success: false,
        message: 'Kunne ikke sende mail',
      },
    }
  }
}

function getReceiverEmail(receiver: string): string {
  switch (receiver) {
    case 'generell':
      return app.config && app.config['ssb.contactform.tomail.generell']
        ? app.config['ssb.contactform.tomail.generell']
        : 'mimir@ssb.no'
    case 'statistikk':
      return app.config && app.config['ssb.contactform.tomail.statistikk']
        ? app.config['ssb.contactform.tomail.statistikk']
        : 'mimir@ssb.no'
    case 'innrapportering':
      return app.config && app.config['ssb.contactform.tomail.innrapportering']
        ? app.config['ssb.contactform.tomail.innrapportering']
        : 'mimir@ssb.no'
    default:
      return app.config && app.config['ssb.contactform.tomail.generell']
        ? app.config['ssb.contactform.tomail.generell']
        : 'mimir@ssb.no'
  }
}
