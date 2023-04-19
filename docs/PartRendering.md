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

### List of admin tools that needs to be changed

- [ ] bestbet
- [ ] dashboard

### List of parts that needs to be changed

- [x] accordion
- [x] article
- [x] articleArchive
- [x] articleList
- [x] attachmentTablesFigures
- [x] bkibolCalculator
- [x] categoryLinks
- [x] contactForm
- [x] divider
- [x] downloadLink
- [x] employee
- [x] employeeList
- [x] endedStatistics
- [ ] entryLinks
- [ ] externalCard
- [x] factBox
- [x] frontpageKeyFigures
- [x] glossary
- [x] headerLink
- [x] highmap
- [ ] husleieCalculator
- [x] infoGraphics
- [x] keyFigure
- [x] kpiCalculator
- [x] links
- [x] localSearch
- [ ] mailChimpForm
- [x] maths
- [x] menuBox
- [x] menuDropdown
- [ ] nameSearch
- [x] omStatistikken
- [x] pictureCardLinks
- [x] pifCalculator
- [x] profiledBox
- [x] profiledLinkIcon
- [x] project
- [x] pubArchiveCalenderLinks
- [x] publicationArchive
- [x] relatedArticles
- [x] relatedExternalLinks
- [x] relatedFactPage
- [x] relatedKostra
- [x] relatedStatistics
- [x] releasedStatistics
- [x] searchResult
- [x] standardCardsList
- [ ] statbankBox
- [x] statbankFrame
- [x] statbankSubjectTree
- [x] staticVisualization
- [ ] statbankLinkList
- [x] statistics
- [x] subjectArticleList
- [ ] table
- [x] tableLink
- [x] upcomingReleases
- [x] variables
