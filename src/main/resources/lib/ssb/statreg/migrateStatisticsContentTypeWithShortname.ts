import { query, modify, type Content } from '/lib/xp/content'
import { run, type ContextParams } from '/lib/xp/context'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { ENONIC_CMS_DEFAULT_REPO } from '/lib/ssb/repo/common'

type StatisticsContentData = {
  statistic?: string
  shortname?: string
}

type StatisticsShortnameMigrationSummary = {
  total: number
  migrated: number
  skippedMissingStatistic: number
  skippedMissingShortname: number
  skippedAlreadyUpdated: number
  failed: number
}

export function migrateStatisticsContentTypeWithShortname(): void {
  const result = query({
    count: -1,
    contentTypes: [`${app.name}:statistics`],
  })

  const context: ContextParams = {
    branch: 'draft',
    repository: ENONIC_CMS_DEFAULT_REPO,
    principals: ['role:system.admin'],
    user: {
      login: 'su',
      idProvider: 'system',
    },
  }

  if (result.hits.length) {
    log.info('Found %s content items', `${Math.trunc(result.total)}`)

    run(context, () => {
      const summary: StatisticsShortnameMigrationSummary = {
        total: result.total,
        migrated: 0,
        skippedMissingStatistic: 0,
        skippedMissingShortname: 0,
        skippedAlreadyUpdated: 0,
        failed: 0,
      }

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
        `${Math.trunc(summary.total)}`,
        `${Math.trunc(summary.migrated)}`,
        `${Math.trunc(summary.skippedMissingStatistic)}`,
        `${Math.trunc(summary.skippedMissingShortname)}`,
        `${Math.trunc(summary.skippedAlreadyUpdated)}`,
        `${Math.trunc(summary.failed)}`
      )
    })
  }
}
