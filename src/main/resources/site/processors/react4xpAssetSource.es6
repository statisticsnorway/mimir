exports.responseProcessor = function (req, res) {
  if (
    res.status === 200 &&
    res.pageContributions &&
    res.pageContributions.bodyEnd &&
    res.pageContributions.bodyEnd.length
  ) {
    if (req.mode === 'edit') {
      res.pageContributions.bodyEnd = res.pageContributions.bodyEnd.filter(
        (src) => src.indexOf('React4xp.CLIENT.hydrate') === -1 && src.indexOf('service/mimir/react4xp') === -1
      )
    } else {
      const exp = new RegExp('srcs*=s*"(.+?)"')
      res.pageContributions.bodyEnd = res.pageContributions.bodyEnd.map((script) => {
        const match = exp.exec(script)
        if (match && match.length === 2 && match[1].indexOf('/_/service/mimir/react4xp') >= 1) {
          let adminPath = ''
          if (req.path.indexOf('/admin') >= 0) {
            adminPath = `${req.path.split('/admin')[0]}/admin`
          }
          script = script.replace(match[1], `${adminPath}/_/${match[1].split('/_/')[1]}`)
        }
        return script
      })
    }
  }
  return res
}
