const portal = __non_webpack_require__('/lib/xp/portal')
const React4xp = __non_webpack_require__('/lib/enonic/react4xp')
const thymeleaf = __non_webpack_require__('/lib/thymeleaf')

const view = resolve('./divider.html')

exports.get = function(req) {
  return renderPart(req)
}

exports.preview = function(req) {
  return renderPart(req)
}

function renderPart(req) {
  const component = portal.getComponent()
  const dividerColor = component.config.dividerColor
  const divider = new React4xp('Divider')

  setColor(dividerColor, divider)

  const model = {
    dividerId: divider.react4xpId
  }

  const preRenderedBody = thymeleaf.render(view, model)

  const preExistingPageContributions = {
    bodyEnd: `<script>
                log.info('Rendered ' + JSON.stringify(${divider.props}))
              </script>`
  }

  return {
    body: divider.renderBody({
      body: preRenderedBody
    }),

    pageContributions: (req.mode === 'live' || req.mode === 'preview') ?
      divider.renderPageContributions({
          pageContributions: preExistingPageContributions
        }) :
      undefined
  }
}

/**
 * Documentation
 */
function setColor(dividerColor, divider) {
  return (dividerColor === 'dark') ? divider.setProps({ dark: true, light: false }) : divider.setProps({ dark: false, light: true })
}
