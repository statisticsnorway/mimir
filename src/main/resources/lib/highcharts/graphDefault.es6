const {
  createDefaultConfig
} = __non_webpack_require__('/lib/highcharts/config')

export function defaultConfig(highchartsContent) {
  return createDefaultConfig(highchartsContent.data, highchartsContent.displayName)
}
