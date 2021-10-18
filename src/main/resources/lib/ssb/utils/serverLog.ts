const {
  isEnabled
} = __non_webpack_require__('/lib/featureToggle')

export function cacheLog(msg: string): void {
  if (app.config && app.config['ssb.log.cache'] && app.config['ssb.log.cache'] === 'true') {
    log.info(msg)
  }
}

export function cronJobLog(msg: string): void {
  if (app.config && app.config['ssb.log.cronJob'] && app.config['ssb.log.cronJob'] === 'true') {
    log.info(msg)
  }
}

export function autoRefreshLog(msg: string): void {
  if (app.config && app.config['ssb.log.autoRefresh'] && app.config['ssb.log.autoRefresh'] === 'true') {
    log.info(`refreshLog :: ${msg}`)
  }
}

// TODO: Remove after issue with statistics not loading in dashboard is fixed
export function getStatisticsDashboardLogging(msg: string): void {
  if (isEnabled('dashboard-statistics-debugging-logs', true, 'ssb')) log.info(`statistics-dashboard-debugging :: ${msg}`)
}

export interface ServerLogLib {
  cacheLog: (msg: string) => void;
  cronJobLog: (msg: string) => void;
  autoRefreshLog: (msg: string) => void;
  getStatisticsDashboardLogging: (msg: string) => void;
}
