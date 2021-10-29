import ReactGA from 'react-ga'

export const addGtagForEvent = (GA_TRACKING_ID, action, category, label) => {
  ReactGA.initialize(GA_TRACKING_ID, {
    debug: true // TODO: Remove manual
  })
  ReactGA.event({
    action,
    category,
    label
  })
}
