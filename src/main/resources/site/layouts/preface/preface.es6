import * as portal from '/lib/xp/portal'
import * as thymeleaf from '/lib/thymeleaf'

exports.get = function(req) {
  const page = portal.getContent()
  const component = portal.getComponent()
  const view = resolve('preface.html')

  const mode = req.mode === 'edit' && 'edit' || page._path.endsWith(req.path.split('/').pop()) ? 'map' : 'municipality'
  const model = { config: component.config, mainRegion: component.regions.main, mode }
  const body = thymeleaf.render(view, model)

  return { body }
}
