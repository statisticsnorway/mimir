import { clearPartFromPartCache } from '/lib/ssb/cache/partCache'

export function run(): void {
  log.info('Clearing parts cache')
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
