import ReactGA from 'react-ga'

export const addGtagForEvent = (GA_TRACKING_ID, action, category, label) => {
  ReactGA.initialize(GA_TRACKING_ID, {
    titleCase: false
  })
  ReactGA.event({
    action,
    category,
    label
  })
  ReactGA.set({
    anonymizeIp: true
  })
}
