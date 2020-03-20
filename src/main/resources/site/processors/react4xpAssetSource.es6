exports.responseProcessor = function(req, res) {
  if (res.status === 200 && res.body) {
    const exp = new RegExp('src\s*=\s*"(.+?)"')
    res.pageContributions.bodyEnd = res.pageContributions.bodyEnd.map((script) => {
      const match = exp.exec(script)
      if (match && match.length === 2 && match[1].indexOf('/_/service/mimir/react4xp') >= 1) {
        script = script.replace(match[1], `/_/${match[1].split('/_/')[1]}`)
      }
      return script
    })
  }
  return res
}
