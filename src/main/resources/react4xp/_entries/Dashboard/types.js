import PropTypes from 'prop-types'

export const StatRegFetchInfo = PropTypes.shape({
  status: PropTypes.string,
  message: PropTypes.string,
  startTime: PropTypes.string,
  completionTime: PropTypes.string
})
