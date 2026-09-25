import { query, modify, type Content } from '/lib/xp/content'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'

const CONTENT_TYPE = `${app.name}:statistics`

type StatisticsContentData = {
  statistic?: string
  shortname?: string
}

export type StatisticsShortnameMigrationSummary = {
  total: number
  migrated: number
  skippedMissingStatistic: number
  skippedMissingShortname: number
  skippedAlreadyUpdated: number
  failed: number
}

export function migrateStatisticsContentTypeWithShortname(): StatisticsShortnameMigrationSummary {
  const result = query({
    count: -1,
    contentTypes: [CONTENT_TYPE],
  })

  const summary: StatisticsShortnameMigrationSummary = {
    total: result.total,
    migrated: 0,
    skippedMissingStatistic: 0,
    skippedMissingShortname: 0,
    skippedAlreadyUpdated: 0,
    failed: 0,
  }

  log.info('Found %s content items', result.total)

  result.hits.forEach((content) => {
    const statisticsContent = content as Content<StatisticsContentData>
    const statisticId = statisticsContent.data.statistic

    if (!statisticId) {
      summary.skippedMissingStatistic += 1
      log.info('Skipping %s - data.statistic is empty', content._path)
      return
    }

    const statistic = getStatisticByIdFromRepo(statisticId)
    if (!statistic?.shortName) {
      summary.skippedMissingShortname += 1
      log.info('Skipping %s - no shortName found for statistic id %s', content._path, statisticId)
      return
    }

    if (statisticsContent.data.shortname === statistic.shortName) {
      summary.skippedAlreadyUpdated += 1
      log.info('Skipping %s - data.shortname is already up to date', content._path)
      return
    }

    try {
      const updated = modify({
        key: content._id,
        requireValid: false,
        editor: (currentContent: Content<StatisticsContentData>) => {
          currentContent.data.shortname = statistic.shortName
          return currentContent
        },
      })

      if (updated) {
        summary.migrated += 1
        log.info('Migrated %s -> %s', content._path, statistic.shortName)
      }
    } catch (error) {
      summary.failed += 1
      log.error('Failed migrating %s -> %s: %s', content._path, statistic.shortName, String(error))
    }
  })

  log.info(
    'Statistics shortname migration finished. Total: %s, migrated: %s, skipped missing statistic: %s, skipped missing shortname: %s, skipped already updated: %s, failed: %s',
    summary.total,
    summary.migrated,
    summary.skippedMissingStatistic,
    summary.skippedMissingShortname,
    summary.skippedAlreadyUpdated,
    summary.failed
  )

  return summary
}
