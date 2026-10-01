import { get as getContent, publish, query, type Content } from '/lib/xp/content'
import { run, type ContextParams } from '/lib/xp/context'
import { getStatisticByIdFromRepo } from '/lib/ssb/statreg/statistics'
import { ENONIC_CMS_DEFAULT_REPO, modifyNode } from '/lib/ssb/repo/common'

type StatisticsContentData = {
  statistic?: string
  shortname?: string
}

type StatisticsShortnameMigrationSummary = {
  total: number
  migrated: number
  published: number
  notPublished: Array<string>
  publishFailed: Array<string>
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

  const draftContext: ContextParams = {
    branch: 'draft',
    repository: ENONIC_CMS_DEFAULT_REPO,
    principals: ['role:system.admin'],
    user: {
      login: 'su',
      idProvider: 'system',
    },
  }

  const masterContext: ContextParams = {
    ...draftContext,
    branch: 'master',
  }

  if (result.hits.length) {
    log.info('Found %s content items', `${Math.trunc(result.total)}`)

    run(draftContext, () => {
      const summary: StatisticsShortnameMigrationSummary = {
        total: result.total,
        migrated: 0,
        published: 0,
        notPublished: [],
        publishFailed: [],
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
          return
        }

        const statistic = getStatisticByIdFromRepo(statisticId)
        if (!statistic?.shortName) {
          summary.skippedMissingShortname += 1
          return
        }

        if (statisticsContent.data.shortname === statistic.shortName) {
          summary.skippedAlreadyUpdated += 1
          return
        }

        try {
          const masterVersion = run(masterContext, () => {
            return getContent<Content<StatisticsContentData>>({ key: content._id })
          })
          const wasPublished = masterVersion?.modifiedTime === content.modifiedTime

          const updated = modifyNode<Content<StatisticsContentData>>(
            ENONIC_CMS_DEFAULT_REPO,
            'draft',
            content._id,
            (currentContent) => {
              currentContent.data.shortname = statistic.shortName
              return currentContent
            }
          )

          if (updated) {
            if (wasPublished) {
              try {
                run(masterContext, () => {
                  publish({
                    keys: [content._id],
                    includeDependencies: false,
                  })
                })
                summary.published += 1
              } catch (publishError) {
                summary.notPublished.push(content._path)
                summary.publishFailed.push(content._path)
                log.error('Failed publishing migrated content %s: %s', content._path, String(publishError))
              }
            } else {
              summary.notPublished.push(content._path)
            }
            summary.migrated += 1
          }
        } catch (error) {
          summary.failed += 1
          log.error('Failed migrating %s -> %s: %s', content._path, statistic.shortName, String(error))
        }
      })

      log.info(
        'Statistics shortname migration finished. Total: %s, migrated: %s, published: %s, skipped missing statistic: %s, skipped missing shortname: %s, skipped already updated: %s, failed: %s',
        `${Math.trunc(summary.total)}`,
        `${Math.trunc(summary.migrated)}`,
        `${Math.trunc(summary.published)}`,
        `${Math.trunc(summary.skippedMissingStatistic)}`,
        `${Math.trunc(summary.skippedMissingShortname)}`,
        `${Math.trunc(summary.skippedAlreadyUpdated)}`,
        `${Math.trunc(summary.failed)}`
      )
      log.info('Migrated but not published: %s', JSON.stringify(summary.notPublished))
      log.info('Failed to publish after migration: %s', JSON.stringify(summary.publishFailed))
    })
  }
}
