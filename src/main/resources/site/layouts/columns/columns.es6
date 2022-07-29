import { render } from '/lib/thymeleaf'

import {render as r4XpRender} from '/lib/enonic/react4xp'

const {
  getComponent
} = __non_webpack_require__('/lib/xp/portal')


const view = resolve('columns.html')

exports.get = function(req) {
  const component = getComponent()
  const {
    size,
    title,
    hideTitle,
    verticalBorder
  } = component.config
  const isGrid = component.config.isGrid && req.mode !== 'edit'

/*  const divider = new React4xp('Divider')
    .setProps({
      light: true
    })
    .uniqueId()*/

  const divider = r4XpRender(
      'Divider',
      {
        light: true
      })

  // Default 50/50
  let leftSize = 'col-12 '
  let rightSize = 'col-12 '
  let rightOffset = ''
  let leftOffset = ''

  if (size === 'a') {
    leftSize += 'col-md-4'
    rightSize += 'col-md-8'
    leftOffset = 'offset-md-8'
    rightOffset = 'offset-md-4'
  } else if (size === 'c') {
    leftSize += 'col-md-8'
    rightSize += 'col-md-4'
    leftOffset = 'offset-md-4'
    rightOffset = 'offset-md-8'
  } else {
    leftSize += 'col-md-6'
    rightSize += 'col-md-6'
    leftOffset = 'offset-md-6'
    rightOffset = 'offset-md-6'
  }

  const leftRegion = component.regions.left.components
  const rightRegion = component.regions.right.components

  const gridComponents = []
  if (isGrid) {
    const max = Math.max(leftRegion.length, rightRegion.length)
    for (let i = 0; i < max; i += 1) {
      const left = leftRegion[i]
      const right = rightRegion[i]
      const prevRight = rightRegion[i - 1]
      if (left) {
        gridComponents.push({
          path: left.path,
          classes: `order-0 ${leftSize}${(!prevRight && i !== 0) ? ` ${leftOffset}` : ''}`,
          order: left.path.slice(-1), // Get the last char of the path (path i.e. /Rad_H/1/left/1)
          regionSide: 'left'
        })
      }
      if (right) {
        gridComponents.push({
          path: right.path,
          classes: `order-1 order-md-0 ${rightSize}${!left ? ` ${rightOffset}` : ''}`,
          order: right.path.slice(-1),
          regionSide: 'right'
        })
      }
    }
  }

  const model = {
    dividerId: divider.react4xpId,
    title,
    hideTitle,
    leftRegion,
    rightRegion,
    leftSize,
    rightSize,
    isGrid,
    gridComponents,
    verticalBorder
  }

  const body = rightRegion.length == 0 ? render(view, model) : divider.renderBody({
    body: render(view, model)
  })

  return {
    body
  }
}
