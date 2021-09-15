# Rendering of parts

## Server side and client side rendering

Due to a bug in react4xp we had to render all parts on the client side in order for them to work. The bug has now been fixed, and we can properly set up serverside rendering for all parts.

## Removing clientside rendering

Most of our parts use clientRender when returning body and pageContributions. This needs to be deleted:

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
- [ ] articleArchive
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
- [ ] pictureCardLink
- [ ] pifCalculator
- [ ] pubArchiveCalenderLinks
- [ ] publicationArchive
- [ ] relatedFactPage
- [ ] releasedStatistics
- [ ] statbankBox
- [ ] statbankLinkList
- [ ] statistics
- [ ] table
- [ ] upcomingReleases
