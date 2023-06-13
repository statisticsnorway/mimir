// @ts-nocheck
import PropTypes from 'prop-types'

export const variableType = PropTypes.shape({
  title: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  href: PropTypes.string,
  fileLocation: PropTypes.string,
  downloadText: PropTypes.string,
  icon: PropTypes.element,
})
