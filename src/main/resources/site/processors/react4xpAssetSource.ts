export function responseProcessor(req: XP.Request, res: XP.Response) {
  if (
    res.status === 200 &&
    res.pageContributions &&
    res.pageContributions.bodyEnd &&
    res.pageContributions.bodyEnd.length
  ) {
    if (req.mode !== 'edit') {
      const exp = new RegExp('srcs*=s*"(.+?)"')
      res.pageContributions.bodyEnd = res.pageContributions.bodyEnd.map((script: string) => {
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
