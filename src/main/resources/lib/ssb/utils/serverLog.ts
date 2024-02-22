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
