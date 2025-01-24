import { type Content } from '/lib/xp/content'
import { type Dataset } from '/lib/types/jsonstat-toolkit'
import { getCalculatorConfig, getCalculatorDatasetFromSource } from '/lib/ssb/dataset/calculator'
import { type CalculatorConfig } from '/site/content-types'

function get(): XP.Response {
  const calculatorConfig: Content<CalculatorConfig> | undefined = getCalculatorConfig()
  const bpiDataset: Dataset | null = calculatorConfig
    ? getCalculatorDatasetFromSource(calculatorConfig, 'bpiCalculator')
    : null

  return {
    body: JSON.stringify(bpiDataset, null, 2),
    contentType: 'application/json',
  }
}
exports.get = get
