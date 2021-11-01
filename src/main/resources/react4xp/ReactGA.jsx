import ReactGA from 'react-ga'

export const addGtagForEvent = (GA_TRACKING_ID, action, category, label) => {
  ReactGA.initialize(GA_TRACKING_ID, {
    debug: true, // TODO: Remove after testing in QA/PROD
    titleCase: false
  })
  ReactGA.event({
    action,
    category,
    label
  })
}
