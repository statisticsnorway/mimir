const content = __non_webpack_require__( '/lib/xp/content')

exports.get = (req) => {
  const jobs = []
  const keyFigureJob = getKeyFigureJob()
  if (keyFigureJob) {
    jobs.push(keyFigureJob)
  }

  return {
    body: {
      jobs
    }
  }
}

function getKeyFigureJob() {
  const max = content.query({
    start: 0,
    count: 0,
    contentTypes: [`${app.name}:keyFigure`],
    query: `data.dataquery LIKE "*"`
  }).total

  if (max === 0) {
    return null
  }

  return {
    label: 'KeyFigure',
    min: 0,
    max,
    current: 0,
    running: false,
    key: 'convert-key-figure'
  }
}
