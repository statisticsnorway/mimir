import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'

// const clearCacheCron: string =
// app.config && app.config['ssb.cron.clearCacheCron'] ? app.config['ssb.cron.clearCacheCron'] : '01 * * * *'

export function run(): void {
  clearPartFromPartCache('kpiCalculator')
  clearPartFromPartCache('pifCalculator')
  clearPartFromPartCache('bkibolCalculator')
  clearPartFromPartCache('husleieCalculator')
  clearPartFromPartCache('omStatistikken')
  clearPartFromPartCache('releasedStatistics')
  clearPartFromPartCache('upcomingReleases')
  clearPartFromPartCache('articleList')
  clearPartFromPartCache('relatedFactPage')
  clearPartFromPartCache('archiveAllPublications-nb')
  clearPartFromPartCache('archiveAllPublications-en')
}