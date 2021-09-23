# Rendering of parts

## Server side and client side rendering

Due to a bug in react4xp we had to client side render all the parts, as they would behave unpredictably. Most if not all parts would come and go. That issue has been resolved so we can properly set up serverside rendering for all the parts now.

## Removing clientside rendering

React4xp components are serverside rendered by default, so in order to disable clientside rendering we have to remove the clientRender property in the renderBody and renderPageContributions calls from most of our parts:

```javascript
return {
  body: externalCardComponent.renderBody({
    body,
    clientRender: req.mode !== "edit",
  }),
  pageContributions: externalCardComponent.renderPageContributions({
    clientRender: req.mode !== "edit",
  }),
};
```

### List of parts that needs to be changed

- [ ] dashboard
- [x] articleArchive
- [ ] attachmentTablesFigures
- [ ] bkibolCalculator
- [ ] contactForm
- [x] divider
- [ ] entryLinks
- [ ] externalCard
- [ ] frontpageKeyFigures
- [ ] husleieCalculator
- [ ] kpiCalculator
- [ ] links
- [ ] localSearch
- [ ] mailChimpForm
- [ ] menuBox
- [ ] menuDropdown
- [ ] nameSearch
- [x] pictureCardLink
- [ ] pifCalculator
- [x] pubArchiveCalenderLinks
- [ ] publicationArchive
- [ ] relatedFactPage
- [x] releasedStatistics
- [ ] statbankBox
- [ ] statbankLinkList
- [x] statistics
- [ ] table
- [x] upcomingReleases
