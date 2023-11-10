// @ts-ignore
import { getComponent } from '/lib/xp/portal'
import { render as r4XpRender } from '/lib/enonic/react4xp'
import { renderError } from '/lib/ssb/error/error'
import { isEnabled } from '/lib/featureToggle'

export function get(req: XP.Request): XP.Response {
  try {
    const part = getComponent<XP.PartComponent.Highchart>()
    if (!part) throw Error('No part found')

    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

export function preview(req: XP.Request): XP.Response {
  try {
    return renderPart(req)
  } catch (e) {
    return renderError(req, 'Error in part', e)
  }
}

function renderPart(req: XP.Request): XP.Response {
  if (!isEnabled('highchart-expert', false, 'ssb')) return { body: '' }

  const component = getComponent<XP.PartComponent.HighchartExpert>()
  if (!component) throw Error('No part found')

  // R4xp disables hydration in edit mode, but highcharts need hydration to show
  // we sneaky swap mode since we want a render of higchart in edit mode
  const _req = req
  if (req.mode === 'edit') _req.mode = 'preview'

  const highchartConfigString = component.config.config

  if (!highchartConfigString) return errorConfig('Ingen konfigurasjon', 'Konfigurasjonen er tom')

  try {
    JSON.parse(highchartConfigString)
  } catch (e) {
    return errorConfig()
  }

  return r4XpRender('site/parts/highchartExpert/HighchartExpert', { config: component.config.config }, _req, {
    body: '<section class="xp-part part-highchart-expert"></section>',
  })
}

function errorConfig(title = 'Feil i JSON konfigurasjon', message = '') {
  const _message =
    message ||
    `JSON konfigurasjonen er ikke gyldig. 
    <br/>
    Sjekk validitet av JSON på <a href="https://jsonlint.com/" target="_blank">jsonlint.com</a>
    <br/>
    Hvis du har kopiert fra en kodesnutt på nettet, kan du prøve å konvertere den til JSON på <a href="https://www.convertsimple.com/convert-javascript-to-json/" target="_blank">convertsimple.com</a>. 
    Det må begynne med <strong>{</strong> og slutte med <strong>}</strong>`

  return {
    body: `<section class="xp-part part-highchart-expert part-config-error">
    <h2>Highchart Ekspert - ${title}</h2>
    <p>
     ${_message}
    </p>
  </section>`,
  }
}
