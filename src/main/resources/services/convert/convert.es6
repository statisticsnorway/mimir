const {
  query
} = __non_webpack_require__( '/lib/xp/content')
const {
  withSuperUserContext
} = __non_webpack_require__( '/lib/repo/common')

exports.get = (req) => {
  return withSuperUserContext('com.enonic.cms.default', 'draft', () => {
    const jobs = []

    const keyFigureJob = getKeyFigureJob()
    if (keyFigureJob) {
      jobs.push(keyFigureJob)
    }

    const highchartJobs = getHighchartJobs()
    if (highchartJobs) {
      jobs.push(highchartJobs)
    }

    return {
      body: {
        jobs
      }
    }
  })
}

function getHighchartJobs() {
  const max = query({
    start: 0,
    count: 0,
    contentTypes: [`${app.name}:highchart`],
    query: `data.dataquery LIKE "*"`
  }).total

  if (max === 0) {
    return null
  }

  return {
    label: 'Highchart',
    min: 0,
    max,
    current: 0,
    running: false,
    key: 'convert-highchart'
  }
}

function getKeyFigureJob() {
  const max = query({
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
