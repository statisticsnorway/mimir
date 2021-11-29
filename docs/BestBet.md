# Best-bet app
A standalone application where we can add and manage best bets to our xp content. The application contains a list of xp contents (such as pages, statistics, articles etc.) and the search words attached to each content. Features include creating new best bets using a form and editing and deleting existing best bets directly through the list.

## File locations
### Admin Tools 
`/src/main/resources/admin/tools/bestbet/`:
[bestBet.html](/src/main/resources/admin/tools/bestbet/bestbet.html)
[bestBet.ts](src/main/resources/admin/tools/bestbet/bestbet.ts)

### React4xp Entries 
`src/main/resources/react4xp/_entries/bestbet/`:
[BestBet.jsx](src/main/resources/react4xp/_entries/bestbet/Bestbet.jsx)
[EditSearchWordsModal.jsx](src/main/resources/react4xp/_entries/bestbet/EditSearchWordsModal.jsx)

### Repository 
`src/main/resources/lib/ssb/repo/`:
[bestBet.ts](src/main/resources/lib/ssb/repo/bestbet.ts)

### Services
`src/main/resources/services/bestBetList/`:
[bestBetList.es6](src/main/resources/services/bestBetList/bestBetList.es6)
[bestBetList.xml](src/main/resources/services/bestBetList/bestBetList.xml)

`src/main/resources/services/contentSearch/`:
[contentSearch.ts](src/main/resources/services/contentSearch/contentSearch.ts)
[contentSearch.xml](src/main/resources/services/contentSearch/contentSearch.xml)

## Repository and Services
Data is stored in the Data Toolbox and an xp service is used to create or manage an existing node to the `no.ssb.bestbet` repository.

The [Best-bet list](src/main/resources/services/bestBetList/bestBetList.es6) is used to fetch and edit data from the repo, whilst the content search service [contentSearch.ts](src/main/resources/services/contentSearch/contentSearch.ts) is used to search through and list all relevant content.

## Controller and View
Get page contributions and asset, service and content studio base urls from controller. Render react4xp component and thymeleaf.

react
axios, promise, states?, modal